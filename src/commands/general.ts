import { Bot } from "grammy";
import { prisma } from "../db.js";
import { normalizeNick, xmlEscape, replySafe } from "../utils.js";
import { EntryType } from "@prisma/client";
import { GROUP_NAME } from "../bot.js";

export function registerGeneralCommands(bot: Bot) {
    // Проверить ник (в ЧС/друзьях)
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+check\s+/i, async (ctx) => {
        const tail = ctx.message!.text!.replace(
            /^(:Джарвис|@talibanlist_bot)\s+check\s+/i,
            ""
        );
        try {
            const { nick, lower } = normalizeNick(tail);

            const enemy = await prisma.entry.findFirst({
                where: { nicknameLower: lower, type: EntryType.ENEMY },
            });
            const friend = await prisma.entry.findFirst({
                where: { nicknameLower: lower, type: EntryType.FRIEND },
            });

            if (!enemy && !friend)
                return replySafe(ctx, `🔍 ${nick}: не найден ни в ЧС, ни в друзьях.`);

            const lines: string[] = ["🔎 Результат:"];
            if (enemy)
                lines.push(`• ЧС${enemy.reason ? ` — причина: ${enemy.reason}` : ""}`);
            if (friend) lines.push(`• Друг`);
            return replySafe(ctx, lines.join("\n"));
        } catch {
            return replySafe(
                ctx,
                "⚠️ Укажи ник. Пример:\n:Джарвис check \"La Plage\""
            );
        }
    });

    // Выдать полный XML списка врагов
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+give\s+full/i, async (ctx) => {
        // const enemies = await prisma.entry.findMany({
        //     where: { type: EntryType.ENEMY },
        //     select: { nickname: true },
        //     orderBy: { nickname: "asc" },
        // });
        //
        // if (!enemies.length) return replySafe(ctx, "⚠️ Список врагов пуст.");
        //
        // const seen = new Set<string>();
        // const names = enemies
        //     .filter((e) => {
        //         const k = e.nickname.toLowerCase();
        //         if (seen.has(k)) return false;
        //         seen.add(k);
        //         return true;
        //     })
        //     .map((e) => e.nickname);
        //
        // const body = names
        //     .map((n) => `  <item name="${xmlEscape(n)}" />`)
        //     .join("\n");
        // const xml = `<group name="${xmlEscape(GROUP_NAME)}">\n${body}\n</group>`;
        //
        // return replySafe(ctx, xml);
        return replySafe(ctx, "test")
    });

    // Help
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+help/i, async (ctx) => {
        const text = `

👤 Все пользователи
• add enemy "НИК В КОВЫЧКА" ПРИЧИНА/ del enemy "НИК"
• add friend "НИК В КОВЫЧКАХ" / del friend "НИК"
• give full — показать XML список врагов
• check НИК — проверить ник в ЧС/друзьях
`;
        return replySafe(ctx, text.trim());
    });
    bot.hears(/^(:Джарвис|@talibanlist_bot)\s+bank/i, async (ctx) => {
        const text = `
Ячейка 10381 НЕВА 
Ячейка 11415 МОСКВА
`;
        return replySafe(ctx, text.trim());
    });
}
