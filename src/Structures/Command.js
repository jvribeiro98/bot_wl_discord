const { ApplicationCommandType } = require('discord.js');


module.exports = class Command {
  constructor(...args) {
    this.name = args.name
    this.description = args.description
    this.type = ApplicationCommandType.ChatInput
    this.options = []
  }
  async run(client, interaction) {
    console.log('Sem resultados')

  }
}