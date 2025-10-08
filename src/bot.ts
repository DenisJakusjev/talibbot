import { Bot } from "grammy";
import "dotenv/config";

const BOT_TOKEN = process.env.BOT_TOKEN!;
if (!BOT_TOKEN) {
    console.error("❌ BOT_TOKEN not found in .env");
    process.exit(1);
}

export const bot = new Bot(BOT_TOKEN);
export const BOT_USERNAME = (process.env.BOT_USERNAME || "").replace(/^@/, "");
export const OWNER_ID = Number(process.env.OWNER_ID!);
export const GROUP_NAME = process.env.GROUP_NAME || "3";
