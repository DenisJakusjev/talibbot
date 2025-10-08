import { Context } from "grammy";

export function normalizeNick(nick: string) {
    const trimmed = nick.trim();
    if (!trimmed) throw new Error("Пустой ник.");
    return { nick: trimmed, lower: trimmed.toLowerCase() };
}

export function replySafe(ctx: Context, text: string) {
    return ctx.reply(text, { reply_to_message_id: ctx.msg?.message_id });
}

export function xmlEscape(s: string) {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
export function parseNickAndReason(tail: string): { nick: string; reason: string } {
    let s = tail.trim();
    if (!s) return { nick: "", reason: "" };

    // Кейс 1: ник в кавычках "..." или «...»
    const starts = s[0];
    if (starts === '"' || starts === "«") {
        const endQuote = starts === "«" ? "»" : '"';
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
