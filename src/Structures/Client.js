const fs = require('node:fs');

module.exports = async (client) => {

    const SlashsArray = [];

    fs.readdir(`./src/SlashCommands`, (error, folder) => {
        folder.forEach((subfolder) => {
            fs.readdir(`./src/SlashCommands/${subfolder}/`, (error, files) => {
                files.forEach((files) => {
                    if (!files?.endsWith(".js")) return;

                    files = require(`../SlashCommands/${subfolder}/${files}`);
                    files = new files();
                    if (!files?.name) return;
                    client.slashCommands.set(files?.name, files);

                    SlashsArray.push(files);
                });
            });
        });
    });

    client.on("ready", async () => {
        client.guilds.cache.forEach((guild) => guild.commands.set(SlashsArray))
    });

    client.on("guildCreate", async (guild) => {
        await guild.commands.set(SlashsArray).catch((e) => {});
    });

    fs.readdir(`./src/Events`, (error, folder) => {
        folder.forEach((subfolder) => {
            fs.readdir(`./src/events/${subfolder}/`, (error, files) => {
                files.forEach((files) => {
                    if (!files.endsWith(".js")) return;

                    let event = require(`../events/${subfolder}/${files}`);
                    event = new event();
                    client.on(event.event, event.exec);
                });
            });
        });
    });
};