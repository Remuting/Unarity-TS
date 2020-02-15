import {readdirSync} from "fs";
import {devs} from "../../config.json";
import {UnarityClient} from "./UnarityClient";
import {BitFieldResolvable, GuildMember, PermissionString} from "discord.js";

export class Handler {
    bot: UnarityClient;

    constructor(bot: UnarityClient) {
        this.bot = bot;
    }

    loadCommands(dir: string) {
        if (!dir) throw Error("No Command Dir Detected.");
        try {
            console.log("Loading Commands");
            readdirSync(dir).forEach((category) => {
                readdirSync(`${dir}/${category}`).filter((cmd) => cmd.endsWith(".js")).forEach((command) => {
                    try {
                        let cmd = (require(`${dir}/${category}/${command}`)).default;
                        cmd = new cmd();
                        cmd.bot = this.bot;
                        cmd.category = category;
                        this.bot.commands.set(cmd.name, cmd);
                        console.log(`Loaded: ${command}`);
                    } catch (e) {
                        console.log(`Error: ${command} =>` + e.stack);
                    }
                });
            });

        } catch (e) {
            console.log(`Error: => ${e}`);
        }

    }

    loadEvents(dir: string) {
        if (!dir) throw Error("No Event Dir Detected");
        try {
            console.log("Loading Events");
            readdirSync(dir).forEach((category) => {
                readdirSync(`${dir}/${category}`).filter((evt) => evt.endsWith(".js")).forEach((event) => {
                    try {
                        let evt = (require(`${dir}/${category}/${event}`)).default;
                        event = event.split(".js")[0];
                        evt = new evt();
                        evt.bot = this.bot;
                        this.bot.on(event, evt.run.bind(null, this.bot));
                        console.log(`Loaded: ${evt.name}`);
                    } catch (e) {
                        console.log(`Error: ${event} => ${e}`);
                    }
                });
            });
        } catch (e) {
            console.log(`Error: => ${e}`);
        }
    }

    getCommand(command: string) {
        return this.bot.commands.get(command) || this.bot.commands.find((cmd) => cmd.options.aliases!.includes(command));
    }

    checkPerms(member: GuildMember, permissions: BitFieldResolvable<PermissionString>) {
        if (!permissions!) return true;
        if (!Array.isArray(permissions)) return member.hasPermission(permissions, {
            checkAdmin: true,
            checkOwner: true
        }) || devs.includes(member.user.id);
        return permissions.some((perm) => member.hasPermission(perm, {
            checkAdmin: true,
            checkOwner: true
        })) || devs.includes(member.user.id);
    }
}