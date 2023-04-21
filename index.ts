import { Client, Collection, GatewayIntentBits, Interaction, REST } from 'discord.js';
import { SlashCommandBuilder } from "@discordjs/builders";
import { config } from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';


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
    
}