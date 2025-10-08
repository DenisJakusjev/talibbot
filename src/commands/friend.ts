import { Bot } from "grammy";
import { prisma } from "../db.js";
import {normalizeNick, parseNickAndReason, replySafe} from "../utils.js";
import { EntryType } from "@prisma/client";

export function registerFriendCommands(bot: Bot) {
    // добавить друга
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+add\s+friend\s+/i, async (ctx) => {
        const tail = ctx.message!.text!.replace(/^(:Джарвис|@talibanlist_bot)\s+add\s+friend\s+/i, "");
        const { nick } = parseNickAndReason(tail); // причина игнорируется
        if (!nick) return replySafe(ctx, "⚠️ Укажи ник. Примеры:\n:Джарвис add friend \"La Plage\"");

        const { nick: clean, lower } = normalizeNick(nick);

        try {
            await prisma.entry.create({
                data: {
                    nickname: clean,
                    nicknameLower: lower,
                    type: EntryType.FRIEND,
                    addedBy: BigInt(ctx.from?.id || 0),
                },
            });
            return replySafe(ctx, `✅ Добавлен в друзья: ${clean}`);
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
