const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType, ButtonBuilder } = require("discord.js");
const config = require("../../../config.json");
const EventEmmiter = require("events");
const connect = require("../../Structures/database");

require("dotenv").config();

module.exports = class interactionCreate extends events {
    constructor(...args) {
        super(...args);
        this.event = "interactionCreate";
    }
    async exec(interaction, client) {
        if (interaction.isButton()) {
            if (interaction.customId.startsWith("botaowl")) {
                await interaction.deferReply({ ephemeral: true });

                const Categorias = {
                    com: {
                        nome: "📋 whitelist-{user-tag}",
                        topico: "Formulario da Whitelist: {user-tag}\n\nID do Usuario: {user-id}\n**NOTA:** Por favor, Não alterar esse topico.",
                        categoria: process.env.idCategoria,
                    },
                };

                const ProcurarCanal = interaction.guild.channels.cache.find((channel) => channel.topic?.includes(interaction.user.id));
                if (ProcurarCanal) {
                    interaction.editReply({
                        content: `Você ja tem uma canal de Whitelsit em aberto!!`,
                        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel(`Atalho para Whitelist!`).setStyle("Link").setURL(`https://discordapp.com/channels/${interaction.guild.id}/${ProcurarCanal.id}`))],
                        ephemeral: true,
                    });
                    return;
                }

                const CategoriaSelecionada = Categorias["com"];
                const CanalCategoria = await interaction.guild.channels.create({
                    name: CategoriaSelecionada.nome.replace(/{user-tag}/g, interaction.user.tag),
                    topic: CategoriaSelecionada.topico.replace(/{user-tag}/g, interaction.user.tag).replace(/{user-id}/g, interaction.user.id),
                    parent: CategoriaSelecionada.categoria,
                    rateLimitPerUser: 0,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ["ViewChannel", "SendMessages", "AddReactions"],
                        },
                        {
                            id: interaction.user.id,
                            allow: ["ViewChannel", "SendMessages", "AttachFiles", "EmbedLinks", "ReadMessageHistory"],
                        },
                    ],
                });
                interaction.editReply({
                    //Sua thread foi aberta, siga as instruções no canal indicado!
                    content: `Sua whitelist foi aberta, siga as instruções no canal indicado!!`,
                    components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel(`Atalho para Whitelist!`).setStyle("Link").setURL(`https://discordapp.com/channels/${interaction.guild.id}/${CanalCategoria.id}`))],
                    ephemeral: true,
                });

                let isDeleted = null;
                setTimeout(() => {
                    CanalCategoria.delete().catch((err) => {});
                    isDeleted = true;
                }, 180000); //180000 =  3 minutos
                if (isDeleted) return;

                class CollectorEvents extends EventEmmiter {}
                const Events = new CollectorEvents();
                let characterName;
                let characterId;
                let question = config.questions[0];

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Sistema de Whitelist", iconURL: interaction.guild.iconURL(), url: "https://discord.io/varletdev" })
                    .addFields({ name: "📋 Pergunta:", value: `\`\`\`${question.question}\`\`\`` })
                    .setColor("#303136")
                    .setImage(process.env.linkImagem || "https://imgur.com/JyJtoQj.png")
                    .setFooter({ text: "🕓 Você tem 3 minuto para responder às perguntas!", iconURL: interaction.guild.iconURL() });

                let m = await CanalCategoria.send({ embeds: [embed] });

                let msgFilter = (m) => m.author.id === interaction.member.id;
                let collector = CanalCategoria.createMessageCollector({ filter: msgFilter });

                let q = 0;

                collector.on("collect", async (msg) => {
                    msg.delete();
                    q += 1;
                    if (q === 1) {
                        characterId = msg.content;

                        embed.setFields();
                        embed.addFields({ name: "📋 Pergunta:", value: `\`\`\`${config.questions[1].question}\`\`\`` });

                        setTimeout(() => {
                            m.edit({ embeds: [embed] });
                        }, 400);
                    } else if (q === 2) {
                        characterName = msg.content;

                        Events.emit("finishedManualQuestions");
                    }
                });

                let select = new StringSelectMenuBuilder().setCustomId("whitelist").setPlaceholder("Choose a option");

                Events.on("finishedManualQuestions", async () => {
                    CanalCategoria.permissionOverwrites.set([
                        {
                            allow: ["ViewChannel"],
                            id: interaction.user.id,
                        },
                        {
                            deny: ["SendMessages", "ViewChannel"],
                            id: interaction.guild.id,
                        },
                    ]);
                    embed.setFields();

                    let firstQuestion = config.quiz[0];

                    embed.addFields({ name: "📋 Pergunta:", value: `\`\`\`${config.quiz[0].question}\`\`\`` });
                    for (let answer of firstQuestion.answers) select.addOptions([{ label: answer, value: answer }]);

                    let row = new ActionRowBuilder().addComponents(select);

                    let msg = await m.edit({ components: [row], embeds: [embed] });

                    let filter = (i) => i.user.id === interaction.member.id;

                    let collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.SelectMenu });

                    let index = 0;
                    let exp = 0;

                    collector.on("collect", async (interaction) => {
                        interaction.deferUpdate();
                        let correct = config.quiz.find((question) => question.correctAnswer === interaction.values[0]);
                        if (correct) exp += 1;

                        if (index >= config.quiz.length - 1) {

                            if (exp >= process.env.acertosWl) {
        
                                connect.query(`UPDATE vrp_users SET whitelisted = '1' WHERE id = '${characterId}'`, async (error, rows) => {
                                    if (error) throw error;
                                    await interaction.member.setNickname(`${characterId} | ${characterName}`).catch((err) => {});
                                    await interaction.member.roles.add(process.env.idcargoCidadao).catch((err) => {});
                                    await interaction.member.roles.remove(process.env.idcargoTurista).catch((err) => {});
                                });
                                   
                                setTimeout(() => {
                                    CanalCategoria.delete().catch((err) => {});
                                    isDeleted = true;
                                }, 30000); //30000 =  30 segundos
                                if (isDeleted) return;


                                const embeda = new EmbedBuilder()
                                    .setAuthor({ name: "Aprovado no sistema de Whitelist |✅", iconURL: interaction.guild.iconURL(), url: "https://discord.io/varletdev" })
                                    .setDescription(`
                                    Usuário: <@${interaction.user.id}>
                                    ID: ${characterId}
                                    Nome do Personagem: ${characterName}\n
                                    **✅| Foi aprovado(a) na Whitelist do nosso Servidor!**
                                    `)
                                    .setThumbnail(interaction.user.avatarURL())
                                    .setColor('#008000')
                                    .addFields(
                                        { name: "》 ``PONTUAÇÃO:``", value: `> ${exp}`, inline: true },
                                        { name: "》 ``Leia as Regras:``", value: '> Seja bem vindo(a)', inline: true },
                                    )
                                    .setTimestamp()
                                    const channel = interaction.guild.channels.cache.find((channel) => channel.id === process.env.idCanalLogsAprovado);
                                    const channel2 = interaction.guild.channels.cache.find((channel) => channel.id === process.env.idCanalLogsStaff);
                                    channel.send({ embeds: [embeda]})
                                    channel2.send({ embeds: [embeda]})

                                const embed3 = new EmbedBuilder()
                                    .setAuthor({ name: "Sistema de Whitelist", iconURL: interaction.guild.iconURL(), url: "https://discord.io/varletdev" })
                                    .addFields(
                                        { name: "Parabéns", value: `\`\`\`Você foi aprovado(a) na Whitelist do nosso Servidor!\`\`\`` },
                                        { name: "Acertos", value: `Você acertou ${exp} questão.`, inline: true },
                                        { name: "channelDelete", value: `Esse canal será deletado em 30 segundos!`, inline: true }
                                    )
                                    .setColor("#303136")
                                    .setImage(process.env.linkImagem || "https://imgur.com/JyJtoQj.png")
                                    .setFooter({ text: interaction.guild.name , iconURL: interaction.guild.iconURL() });
                                msg.edit({
                                    embeds: [embed3],
                                    components: [],
                                });
                            } else {
                                setTimeout(() => {
                                    CanalCategoria.delete().catch((err) => {});
                                    isDeleted = true;
                                }, 30000); //30000 =  30 segundos
                                if (isDeleted) return;

                                const embedr = new EmbedBuilder()
                                .setAuthor({ name: "Aprovado no sistema de Whitelist |❌", iconURL: interaction.guild.iconURL(), url: "https://discord.io/varletdev" })
                                .setDescription(`
                                Usuário: <@${interaction.user.id}>
                                ID: ${characterId}
                                Nome do Personagem: ${characterName}\n
                                **❌| Foi reprovado(a) na Whitelist do nosso Servidor!**
                                `)
                                .setThumbnail(interaction.user.avatarURL())
                                .setColor('#FF0000')
                                .addFields(
                                    { name: "》 ``PONTUAÇÃO:``", value: `> ${exp}`, inline: true },
                                    { name: "》 ``Leia as Regras:``", value: '> Boa sorte na proxima vez', inline: true },
                                )
                                .setTimestamp()
                          
                                const channel = interaction.guild.channels.cache.find((channel) => channel.id === process.env.idCanalLogsReprovado);
                                const channel2 = interaction.guild.channels.cache.find((channel) => channel.id === process.env.idCanalLogsStaff);
                                channel.send({ embeds: [embedr]})
                                channel2.send({ embeds: [embedr]})

                                let embed4 = new EmbedBuilder()
                                    .setAuthor({ name: "Sistema de Whitelist", iconURL: interaction.guild.iconURL(), url: "https://discord.io/varletdev" })
                                    .addFields({ name: "Reprovado", value: `\`\`\`Você foi reprovado(a) na Whitelist do nosso Servidor!\`\`\`` }, { name: "Tente novamente", value: `\`\`\`Esse canal será deletado em 30 segundos!\`\`\`` })
                                    .setColor("#303136")
                                    .setImage(process.env.linkImagem || "https://imgur.com/JyJtoQj.png")
                                    .setFooter({ text: interaction.guild.name , iconURL: interaction.guild.iconURL() });
                                msg.edit({
                                    embeds: [embed4],
                                    components: [],
                                });
                            }
                            return;
                        }
                        index += 1;

                        let question = config.quiz[index];

                        select.setOptions();

                        const questionEmbed = new EmbedBuilder()
                            .setAuthor({ name: "Sistema de Whitelist", iconURL: interaction.guild.iconURL(), url: "https://discord.io/varletdev" })
                            .addFields({ name: "📋 Pergunta:", value: `\`\`\`${question.question}\`\`\`` })
                            .setColor("#303136")
                            .setImage(process.env.linkImagem || "https://imgur.com/JyJtoQj.png")
                            .setFooter({ text: "🕓 Você tem 1 minuto para responder às perguntas!", iconURL: interaction.guild.iconURL() });

                        for (let answer of question.answers) select.addOptions([{ label: answer, value: answer }]);
                        setTimeout(() => {
                            msg.edit({ components: [new ActionRowBuilder().addComponents(select)], embeds: [questionEmbed] });
                        }, 400);
                    });
                });
            }
        }
    }
};