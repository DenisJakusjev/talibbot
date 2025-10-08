import { PrismaClient, EntryType } from "@prisma/client";
import { Context } from "grammy";
import { normalizeNick, xmlEscape } from "./utils.js";

// Prisma error code for unique constraint violation
const UNIQUE_VIOLATION = "P2002";

export class CommandService {
    constructor(
        private prisma: PrismaClient,
        private ownerId: number,
        private groupName: string
    ) {}

    private async isModOrOwner(tgId: number | undefined) {
        if (!tgId) return false;
        if (tgId === this.ownerId) return true;
        const u = await this.prisma.user.findUnique({ where: { tgId: BigInt(tgId) } });
        return !!u;
    }

    // ===== OWNER ONLY =====
    async addModById(ctx: Context, tgIdRaw: string, nickname: string) {
        if (ctx.from?.id !== this.ownerId)
            return ctx.reply("⛔ Только владелец может добавлять модераторов.");

        const tgIdNum = Number(tgIdRaw);
        if (!Number.isFinite(tgIdNum)) {
            return ctx.reply(
                "⚠️ TG_ID должен быть числом. Пример: :Джарвис add modid 514839274 Nick"
            );
        }
        const { nick, lower } = normalizeNick(nickname);

        try {
            await this.prisma.user.upsert({
                where: { tgId: BigInt(tgIdNum) },
                update: { nickname: nick, nicknameLower: lower },
                create: { tgId: BigInt(tgIdNum), nickname: nick, nicknameLower: lower },
            });
            return ctx.reply(`✅ Модератор добавлен: ${nick} (tgId=${tgIdNum})`);
        } catch (e: any) {
            return ctx.reply(`❌ Ошибка добавления модератора: ${e?.message ?? "см. логи"}`);
        }
    }

    async delModByNickname(ctx: Context, nickname: string) {
        if (ctx.from?.id !== this.ownerId)
            return ctx.reply("⛔ Только владелец может убирать модераторов.");

        const { lower } = normalizeNick(nickname);
        const res = await this.prisma.user.deleteMany({ where: { nicknameLower: lower } });
        return ctx.reply(res.count ? `✅ Удалено модераторов: ${res.count}` : "⚠️ Модератор не найден.");
    }

    // ===== MOD + OWNER =====
    async addEnemy(ctx: Context, nickname: string, reason: string) {
        const tgId = ctx.from?.id;

        const { nick, lower } = normalizeNick(nickname);
        try {
            await this.prisma.entry.create({
                data: {
                    nickname: nick,
                    nicknameLower: lower,
                    type: EntryType.ENEMY,
                    reason,
                    addedBy: BigInt(tgId!),
                } as any,
            });
            return ctx.reply(`✅ Добавлен в ЧС: ${nick}${reason ? ` — ${reason}` : ""}`);
        } catch (e: any) {
            if (e?.code === UNIQUE_VIOLATION) return ctx.reply("ℹ️ Уже в ЧС.");
            return ctx.reply(`❌ Ошибка: ${e?.message ?? "см. логи"}`);
        }
    }

    async delEnemy(ctx: Context, nickname: string) {
        const { lower } = normalizeNick(nickname);
        const res = await this.prisma.entry.deleteMany({
            where: { nicknameLower: lower, type: EntryType.ENEMY } as any,
        });
        return ctx.reply(res.count ? `✅ Удалено записей: ${res.count}` : "⚠️ Не найдено в ЧС.");
    }

    async addFriend(ctx: Context, nickname: string) {
        const tgId = ctx.from?.id;

        const { nick, lower } = normalizeNick(nickname);
        try {
            await this.prisma.entry.create({
                data: {
                    nickname: nick,
                    nicknameLower: lower,
                    type: EntryType.FRIEND,
                    addedBy: BigInt(tgId!),
                } as any,
            });
            return ctx.reply(`✅ Добавлен в друзья: ${nick}`);
        } catch (e: any) {
            if (e?.code === UNIQUE_VIOLATION) return ctx.reply("ℹ️ Уже в друзьях.");
            return ctx.reply(`❌ Ошибка: ${e?.message ?? "см. логи"}`);
        }
    }

    async delFriend(ctx: Context, nickname: string) {
        const { lower } = normalizeNick(nickname);
        const res = await this.prisma.entry.deleteMany({
            where: { nicknameLower: lower, type: EntryType.FRIEND } as any,
        });
        return ctx.reply(res.count ? `✅ Удалено записей: ${res.count}` : "⚠️ Не найдено в друзьях.");
    }

    // ===== PUBLIC =====
    async check(ctx: Context, nickname: string) {
        const { nick, lower } = normalizeNick(nickname);

        const enemy = await this.prisma.entry.findFirst({
            where: { nicknameLower: lower, type: EntryType.ENEMY } as any,
        });
        const friend = await this.prisma.entry.findFirst({
            where: { nicknameLower: lower, type: EntryType.FRIEND } as any,
        });

        if (!enemy && !friend)
            return ctx.reply(`🔍 ${nick}: не найден ни в ЧС, ни в друзьях.`);

        const lines: string[] = ["🔎 Результат:"];
        if (enemy)
            lines.push(`• ${nick.toUpperCase()} в ЧС${enemy.reason ? ` — причина: ${enemy.reason}` : ""}`);
        if (friend) lines.push(`• Друг`);
        return ctx.reply(lines.join("\n"));
    }

    async giveFull(ctx: Context) {
        const enemies = await this.prisma.entry.findMany({
            where: { type: EntryType.ENEMY },
            select: { nickname: true },
            orderBy: { nickname: "asc" },
        });

        if (!enemies.length) {
            return ctx.reply("⚠️ Список врагов пуст.");
        }

        const seen = new Set<string>();
        const names = enemies
            .filter((e) => {
                const k = e.nickname.toLowerCase();
                if (seen.has(k)) return false;
                seen.add(k);
                return true;
            })
            .map((e) => e.nickname);

        const body = names.map((n) => `  <item name="${xmlEscape(n)}" />`).join("\n");
        const xml = `<group name="${xmlEscape(this.groupName)}">\n${body}\n</group>`;

        return ctx.reply(xml, { reply_to_message_id: ctx.msg?.message_id });
    }

}
