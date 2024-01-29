module.exports = class ping extends Command {
    constructor(...args) {
        super(...args);
        this.name = "cleardm";
        this.description = "[🧀 Utilities] Clear all Yulla messages in your DM";
    }
    async run(client, interaction) {
        const dm = await interaction.member.createDM();
        await interaction.reply({
            content: `🔁 **| ${interaction.user}, I'm clearing your dm, I was getting tired of so many messages**`,
            ephemeral: true,
        });

        setTimeout(() => {
            interaction.editReply({
                content: `✅ **| ${interaction.user}, I successfully cleared your DM, Phew! I'm lighter now.**`, 
                ephemeral: true
            });
        }, 5000);

        setTimeout(() => {
            interaction.editReply({
                content: `📝 **| ${interaction.user}, to delete this message click on "Ignore Message".**`,
                ephemeral: true
            });
        }, 15000);

        const deleteMessages = await client.channels.cache.get(dm.id).messages.fetch({ limit: 99 });

        await deleteMessages.map((msg) => {
            if (msg.author.bot) {
                msg.delete();
            }
        });
    }
};