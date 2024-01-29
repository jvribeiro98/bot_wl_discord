
module.exports = class guildMemberAdd extends events {
    constructor(...args) {
        super(...args);
        this.event = "guildMemberAdd";
    }
    exec(member) {
        member?.roles.add(process.env.idcargoTurista)
    }
};