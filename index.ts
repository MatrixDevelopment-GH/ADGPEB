import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, Collection, Events, GatewayIntentBits, Interaction, REST, Routes } from 'discord.js';
import { config } from "dotenv";
import fs from 'node:fs/promises';
import path from 'node:path';
import { exit } from "node:process";
import { createInterface } from "node:readline";
config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ]
});

interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: Interaction) => void
}

let commands = new Collection<String, Command>();

const cmdPath = path.join(path.resolve(), 'commands'); // get the commands folder
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN as string);

async function reload() {
    const cmdFile = (await fs.readdir(cmdPath)).filter(
        (file: string) => file.endsWith('.ts')
    ) // get the command files
    commands.clear()
    for (const file of cmdFile) {
        const filePath = "file:///" + path.join(cmdPath, file);
        const { default: command } = await import(filePath);

        if ('data' in command && 'execute' in command) {
            console.log(command.data.name);
            commands.set(command.data.name, command);
        }
    }
    try {
        console.log(`Started refreshing ${commands.size} application (/) commands.`);
        const data: any = await rest.put(
            (process.env.GUILD_ID as any) ? Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.GUILD_ID as string) : Routes.applicationCommands(process.env.CLIENT_ID as string),
            { body: Array.from(await commands.values()).map((command) => command.data.toJSON()) },
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
}

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction[interaction.replied ? 'followUp' : 'reply']({ content: 'There was an error while executing this command!', ephemeral: true })
    }
});

client.once(Events.ClientReady, c => {
    console.log(`------ WALL STREET BOT ------`);
    console.log(`Tag: ${c.user.tag}`);
    console.log(`ID: ${c.user.id}`);

})
await reload();
client.login(process.env.TOKEN);