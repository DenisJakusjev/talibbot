import { Bot } from "grammy";
import { prisma } from "../db.js";
import { OWNER_ID } from "../bot.js";
import { normalizeNick, replySafe } from "../utils.js";
import { Role } from "@prisma/client";

export function registerModCommands(bot: Bot) {
    // добавить модератора (OWNER)
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+add\s+modid\s+/i, async (ctx) => {
        if (ctx.from?.id !== OWNER_ID)
            return replySafe(ctx, "⛔ Только владелец может добавлять модераторов.");

        const args = ctx.message!.text!.split(/\s+/).slice(3);
        const [tgIdRaw, ...rest] = args;
        const tgIdNum = Number(tgIdRaw);
        if (!Number.isFinite(tgIdNum))
            return replySafe(ctx, "⚠️ TG_ID должен быть числом.");
        const nickname = rest.join(" ");
        const { nick, lower } = normalizeNick(nickname);

        await prisma.user.upsert({
            where: { tgId: BigInt(tgIdNum) },
            update: { nickname: nick, nicknameLower: lower },
            create: { tgId: BigInt(tgIdNum), nickname: nick, nicknameLower: lower, role: Role.MOD },
        });

        return replySafe(ctx, `✅ Модератор добавлен: ${nick} (tgId=${tgIdNum})`);
    });

    // удалить модератора (OWNER)
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+del\s+mod\s+/i, async (ctx) => {
        if (ctx.from?.id !== OWNER_ID)
            return replySafe(ctx, "⛔ Только владелец может убирать модераторов.");

        const args = ctx?.message!.text!.split(/\s+/).slice(3);
        const nickname = args?.join(" ");
        const { lower } = normalizeNick(nickname);

        const res = await prisma.user.deleteMany({ where: { nicknameLower: lower } });
        return replySafe(ctx, res.count ? `✅ Удалено модераторов: ${res.count}` : "⚠️ Модератор не найден.");
    });
}
