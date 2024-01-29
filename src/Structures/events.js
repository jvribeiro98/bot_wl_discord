module.exports = class events {
  constructor(...args) {
    this.event = args.event
  }
  exec() {
    console.log(`Evento ${this.event} não foi definido.`)
  }
}