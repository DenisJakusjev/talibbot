import { Bot } from "grammy";
import { prisma } from "../db.js";
import { normalizeNick, replySafe, parseNickAndReason, xmlEscape } from "../utils.js";
import { EntryType } from "@prisma/client";

export function registerEnemyCommands(bot: Bot) {
    // Добавить врага (любой пользователь)
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+add\s+enemy\s+/i, async (ctx) => {
        // хвост после "add enemy"
        const tail = ctx.message!.text!.replace(/^(:Джарвис|@talibanlist_bot)\s+add\s+enemy\s+/i, "");
        const { nick, reason } = parseNickAndReason(tail);
        if (!nick) {
            return replySafe(
                ctx,
                "⚠️ Укажи ник. Примеры:\n:Джарвис add enemy \"La Plage\" ниндзя-лут\n:Джарвис add enemy La Plage | ниндзя-лут"
            );
        }

        const { nick: clean, lower } = normalizeNick(nick);

        try {
            await prisma.entry.create({
                data: {
                    nickname: clean,             // показываем как ввели
                    nicknameLower: lower,        // ищем по lower
                    type: EntryType.ENEMY,
                    reason,
                    addedBy: BigInt(ctx.from?.id || 0),
                },
            });
            return replySafe(ctx, `✅ Добавлен в ЧС: ${clean}${reason ? ` — ${reason}` : ""}`);
        } catch (e: any) {
            if (e.code === "P2002") return replySafe(ctx, "ℹ️ Уже в ЧС.");
            return replySafe(ctx, `❌ Ошибка: ${e.message}`);
        }
    });

    // Удалить врага (любой пользователь)
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+del\s+enemy\s+/i, async (ctx) => {
        const tail = ctx.message!.text!.replace(/^(:Джарвис|@talibanlist_bot)\s+del\s+enemy\s+/i, "");
        const { lower } = normalizeNick(tail);
        const res = await prisma.entry.deleteMany({
            where: { nicknameLower: lower, type: EntryType.ENEMY },
        });
        return replySafe(ctx, res.count ? `✅ Удалено: ${res.count}` : "⚠️ Не найдено в ЧС.");
    });

    // (опционально) Быстрая выдача XML только врагов с уникализацией — вынесено в general.ts -> give full
}
