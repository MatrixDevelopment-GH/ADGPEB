import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with pong!"),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply("Pong!");
    }
}