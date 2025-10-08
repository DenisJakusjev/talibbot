import { Bot } from "grammy";
import { registerModCommands } from "./mod.js";
import { registerEnemyCommands } from "./enemy.js";
import { registerFriendCommands } from "./friend.js";
import { registerGeneralCommands } from "./general.js";

export function registerAllCommands(bot: Bot) {
    registerModCommands(bot);
    registerEnemyCommands(bot);
    registerFriendCommands(bot);
    registerGeneralCommands(bot);
}
