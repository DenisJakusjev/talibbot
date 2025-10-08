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
