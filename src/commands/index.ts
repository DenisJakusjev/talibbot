import { Bot } from "grammy";
import { registerModCommands } from "./mod";
import { registerEnemyCommands } from "./enemy";
import { registerFriendCommands } from "./friend";
import { registerGeneralCommands } from "./general";

export function registerAllCommands(bot: Bot) {
    registerModCommands(bot);
    registerEnemyCommands(bot);
    registerFriendCommands(bot);
    registerGeneralCommands(bot);
}
