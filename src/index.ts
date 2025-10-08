import { bot } from "./bot.js";
import { ensureConnected } from "./db.js";
import { registerAllCommands } from "./commands";

await ensureConnected();
registerAllCommands(bot);

bot.start();
console.log("🤖 Jarvis bot started and ready");
