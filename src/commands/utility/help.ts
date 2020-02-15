import {Command} from "../../lib";
import {Message} from "discord.js";

export default class extends Command {
    constructor() {
        super("help", {
            aliases: ["h"],
            description: "Displays informations of commands",
            usage: "!help [command]"
        });
    }

    run(message: Message, [query]: string[]) {
        let helpEmbed = message.embed();
        if (query && this.bot!.handler.getCommand(query)) {
            const command = this.bot!.handler.getCommand(query)!;
            helpEmbed
                .setTitle(`${command.name[0].toUpperCase() + command.name.slice(1)}'s information`)
                .setDescription([`**Category:** ${command.category}`,
                    `**Description:** ${command.options.description || "Not Provided"}`,
                    `**Usage:** ${command.options.usage || "Not Provided"}`,
                    `**Cooldown:** ${command.options.cooldown || 0}ms`]
                    .join("\n"))
                .addField("User Permissions Needed", (command.userPermissions as string[]).join(", ") || "None")
                .addField("Bot Permissions Needed", (command.botPermissions as string[]).join(", ") || "Send Message, Embed Links")
                .setFooter("[] = optional, {} = needed");
        } else {
            helpEmbed
                .setTitle("Command")
                .setDescription("!help [command] for more information");
            const commands = this.bot!.commands;
            const categories = this.bot!.commands
                // @ts-ignore
                .reduce((acc, cmd) => acc.includes(cmd.category) ? acc : [...acc, cmd.category], []).sort();
            categories.forEach((cat: string) => {
                helpEmbed.addField(cat[0].toUpperCase() + cat.slice(1), commands.filter((cmd) => cmd.category === cat)
                    .sort()
                    .map((cmd) => `\`${cmd.name}\``)
                    .join(", "))
            });
        }

        message.channel.send(helpEmbed);
    }
};