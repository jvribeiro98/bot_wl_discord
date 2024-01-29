const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = class ping extends Command {
    constructor(...args) {
        super(...args);
        this.name = "setwhitelist";
        this.description = "[🕵️ Moderators] Submit the whitelist ad";
    }
    async run(client, interaction) {
        await interaction.deferReply({ ephemeral: true })

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.editReply({ content: `**❌| Você não tem permissão para utilizar este comando.**` })

        const embed = new EmbedBuilder()
        .setAuthor({ name: "Sistema de Whitelist", iconURL: interaction.guild.iconURL(), url: "https://discord.io/varletdev" })
        .setDescription("*Faça a Allowlist para ser liberado em nosso servidor*\n*Para iniciar a whitelist Clique no botão* **📋 Iniciar whitelist**\n")
        .addFields(
            { name: "BOA SORTE!:", value: `🕓 *Você tera* **3 minuto** *para responder às perguntas!*`}
            )
        .setColor("#303136")
        .setImage(process.env.linkImagem || "https://imgur.com/JyJtoQj.png")

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("botaowl").setLabel(`Iniciar whitelist`).setStyle(process.env.colorButton || Secondary)
        );
        await interaction.channel.send({ embeds: [embed], components: [button] });
        await interaction.editReply({ content: '✅| Evento da whitelist enviado' })
    }
};