const client = require("../../index");
const Discord = require("discord.js");
module.exports = class interactionCreate extends events {
    constructor(...args) {
        super(...args);
        this.event = "interactionCreate";
    }
    exec(interaction) {
        if (interaction.type === Discord.InteractionType.ApplicationCommand) {
            const cmd = client.slashCommands.get(interaction.commandName);

            if (!cmd) return interaction.reply(`Error`);

            interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);

            cmd.run(client, interaction);
        }
    }
};