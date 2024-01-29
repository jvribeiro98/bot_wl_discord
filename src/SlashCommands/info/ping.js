module.exports = class ping extends Command {
  constructor(...args){
    super(...args)
    this.name = "ping"
    this.description = "mostra o meu ping"
  }
  async run (client, interaction) {
    await interaction.deferReply({ ephemera: true })
    const ping = client.ws.ping
    interaction.editReply({ content: `**Meu ping é de: \`${ping}\`**` })
  }
}