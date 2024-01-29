
module.exports = class ready extends events {
    constructor(...args) {
        super(...args);
        this.event = "ready";
    }

    async exec(client) {
    
        console.log(`Bot Online ✅`)

        let ram = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;

        console.log(ram);
    }
};