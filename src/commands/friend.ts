import { Bot } from "grammy";
import { prisma } from "../db.js";
import { normalizeNick, replySafe } from "../utils.js";
import { EntryType } from "@prisma/client";

export function registerFriendCommands(bot: Bot) {
    // добавить друга
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+add\s+friend\s+/i, async (ctx) => {
        const args = ctx.message!.text!.split(/\s+/).slice(3);
        const nickname = args.join(" ");
        const { nick, lower } = normalizeNick(nickname);

        try {
            await prisma.entry.create({
                data: {
                    nickname: nick,
                    nicknameLower: lower,
                    type: EntryType.FRIEND,
                    addedBy: BigInt(ctx.from?.id || 0),
                },
            });
            return replySafe(ctx, `✅ Добавлен в друзья: ${nick}`);
        } catch (e: any) {
            if (e.code === "P2002") return replySafe(ctx, "ℹ️ Уже в друзьях.");
            return replySafe(ctx, `❌ Ошибка: ${e.message}`);
        }
    });

    // удалить друга
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+del\s+friend\s+/i, async (ctx) => {
        const args = ctx.message!.text!.split(/\s+/).slice(3);
        const nickname = args.join(" ");
        const { lower } = normalizeNick(nickname);
        const res = await prisma.entry.deleteMany({
            where: { nicknameLower: lower, type: EntryType.FRIEND },
        });
        return replySafe(ctx, res.count ? `✅ Удалено: ${res.count}` : "⚠️ Не найдено в друзьях.");
    });
}
