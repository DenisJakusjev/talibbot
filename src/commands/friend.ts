import { Bot } from "grammy";
import { prisma } from "../db.js";
import { normalizeNick, replySafe, parseNickAndReason } from "../utils.js";
import { EntryType } from "@prisma/client";

export function registerFriendCommands(bot: Bot) {
    // Добавить друга (любой пользователь)
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+add\s+friend\s+/i, async (ctx) => {
        // хвост после "add friend"
        const tail = ctx.message!.text!.replace(/^(:Джарвис|@talibanlist_bot)\s+add\s+friend\s+/i, "");
        // используем общий парсер, но причину игнорируем
        const { nick } = parseNickAndReason(tail);
        if (!nick) {
            return replySafe(
                ctx,
                '⚠️ Укажи ник. Пример:\n:Джарвис add friend "La Plage"'
            );
        }

        const { nick: clean, lower } = normalizeNick(nick);

        try {
            await prisma.entry.create({
                data: {
                    nickname: clean,      // показываем как ввели
                    nicknameLower: lower, // ищем по lower
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

    // Удалить друга (любой пользователь)
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+del\s+friend\s+/i, async (ctx) => {
        const tail = ctx.message!.text!.replace(/^(:Джарвис|@talibanlist_bot)\s+del\s+friend\s+/i, "");
        const { lower } = normalizeNick(tail);
        const res = await prisma.entry.deleteMany({
            where: { nicknameLower: lower, type: EntryType.FRIEND },
        });
        return replySafe(ctx, res.count ? `✅ Удалено: ${res.count}` : "⚠️ Не найдено в друзьях.");
    });
}
