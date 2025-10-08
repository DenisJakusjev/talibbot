import { Bot } from "grammy";
import { prisma } from "../db.js";
import { normalizeNick, replySafe } from "../utils.js";
import { EntryType } from "@prisma/client";

export function registerEnemyCommands(bot: Bot) {
    // добавить врага
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+add\s+enemy\s+/i, async (ctx) => {
        const args = ctx.message!.text!.split(/\s+/).slice(3);
        const [nickname, ...rest] = args;
        const reason = rest.join(" ");
        const { nick, lower } = normalizeNick(nickname);

        try {
            await prisma.entry.create({
                data: {
                    nickname: nick,
                    nicknameLower: lower,
                    type: EntryType.ENEMY,
                    reason,
                    addedBy: BigInt(ctx.from?.id || 0),
                },
            });
            return replySafe(ctx, `✅ Добавлен в ЧС: ${nick}${reason ? ` — ${reason}` : ""}`);
        } catch (e: any) {
            if (e.code === "P2002") return replySafe(ctx, "ℹ️ Уже в ЧС.");
            return replySafe(ctx, `❌ Ошибка: ${e.message}`);
        }
    });

    // удалить врага
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+del\s+enemy\s+/i, async (ctx) => {
        const args = ctx.message!.text!.split(/\s+/).slice(3);
        const nickname = args.join(" ");
        const { lower } = normalizeNick(nickname);
        const res = await prisma.entry.deleteMany({
            where: { nicknameLower: lower, type: EntryType.ENEMY },
        });
        return replySafe(ctx, res.count ? `✅ Удалено: ${res.count}` : "⚠️ Не найдено в ЧС.");
    });
}
