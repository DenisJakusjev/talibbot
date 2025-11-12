import { Context } from "grammy";

/**
 * Снимает обрамляющие кавычки: "…", '…', «…»
 */
export function unquote(s: string) {
    const str = s.trim();
    const pairs: [string, string][] = [
        ['"', '"'],
        ["'", "'"],
        ["«", "»"],
    ];
    for (const [l, r] of pairs) {
        if (str.startsWith(l) && str.endsWith(r) && str.length >= 2) {
            return str.slice(1, -1).trim();
        }
    }
    return str;
}

/**
 * Нормализуем ник для поиска:
 * - снимаем обрамляющие кавычки и пробелы по краям
 * - НИЧЕГО не меняем внутри (сохраняем как ввели)
 * - возвращаем nick (оригинал для вывода) и lower (для поиска)
 */
export function normalizeNick(nick: string) {
    const t = unquote(nick).trim();
    if (!t) throw new Error("Пустой ник.");
    return { nick: t, lower: t.toLowerCase() };
}

/**
 * Парсим хвост после команды add enemy:
 * поддерживает:
 *  - "La Plage" причина
 *  - «La Plage» причина
 *  - La Plage | причина
 *  - BadGuy причина
 */
export function parseNickAndReason(tail: string): { nick: string; reason: string } {
    let s = tail.trim();
    if (!s) return { nick: "", reason: "" };

    // Кейс 1: ник в кавычках "..." или «...»
    const starts = s[0];
    if (starts === '"' || starts === "«" || starts === "'") {
        const endQuote = starts === "«" ? "»" : starts;
        const end = s.indexOf(endQuote, 1);
        if (end > 1) {
            const nick = s.slice(1, end).trim();
            let rest = s.slice(end + 1).trim();
            if (rest.startsWith("|")) rest = rest.slice(1).trim(); // допускаем "| причина"
            return { nick, reason: rest };
        }
    }

    // Кейс 2: разделитель |
    const pipe = s.indexOf("|");
    if (pipe !== -1) {
        const nick = s.slice(0, pipe).trim();
        const reason = s.slice(pipe + 1).trim();
        return { nick, reason };
    }

    // Кейс 3: по умолчанию — первое слово ник, дальше причина
    const parts = s.split(/\s+/);
    const nick = parts.shift() ?? "";
    const reason = parts.join(" ").trim();
    return { nick, reason };
}

export function replySafe(ctx: Context, text: string) {
    return ctx.reply(text, { reply_to_message_id: ctx.msg?.message_id });
}
console.log("TestingTEST")
export function xmlEscape(s: string) {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
