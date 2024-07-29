const {
  Client,
  GatewayIntentBits,
  Partials,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const client = new Client({
  intents: Object.keys(GatewayIntentBits),
  partials: Object.keys(Partials),
});
const config = require("../config.json");
client.once("ready", () => {
  console.log("Hazır");
  client.user.setPresence({
    activities: [
      {
        name: "takachi was here.",
      },
    ],
    status: "idle",
  });
});
const guild = client.guilds.cache.get(config.guildID);
client.on("messageCreate", async (message) => {
  if (message.content === ".logkur") {
    if (!config.ownerID.includes(message.author.id)) {
      return;
    }

    let category = guild.channels.cache.find(
      (c) => c.name === "Audit Log's" && c.type === ChannelType.GuildCategory,
    );
    if (!category) {
      category = await guild.channels.create({
        name: "Audit Log's",
        type: ChannelType.GuildCategory,
      });
    }

    const eventTypes = [
      "messageUpdate",
      "messageDelete",
      "channelCreate",
      "channelUpdate",
      "channelDelete",
      "roleCreate",
      "roleUpdate",
      "roleDelete",
      "guildUpdate",
      "emojiCreate",
      "emojiUpdate",
      "emojiDelete",
      "integrationCreate",
      "integrationUpdate",
      "integrationDelete",
      "webhookCreate",
      "webhookUpdate",
      "webhookDelete",
      "stickerCreate",
      "stickerUpdate",
      "stickerDelete",
      "inviteCreate",
      "inviteDelete",
      "guildScheduledEventCreate",
      "guildScheduledEventUpdate",
      "guildScheduledEventDelete",
      "interactionCreate",
      "messageReactionAdd",
      "messageReactionRemove",
      "messageReactionRemoveAll",
      "presenceUpdate",
      "stageInstanceCreate",
      "stageInstanceUpdate",
      "stageInstanceDelete",
      "userUpdate",
    ];

    for (const event of eventTypes) {
      const channelName = event
        .toLowerCase()
        .replace(/([a-z])([A-Z])/g, "$1-$2");
      const channel = guild.channels.cache.find(
        (c) => c.name === channelName && c.type === ChannelType.GuildText,
      );
      if (!channel) {
        await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category.id,
        });
      }
    }

    message.reply("Log kanalları başarıyla oluşturuldu.");
  }
});

client.on("guildAuditLogEntryCreate", async (auditLogEntry) => {
  const { action, target, changes, reason } = auditLogEntry;

  const eventType = action.toLowerCase().replace(/([a-z])([A-Z])/g, "$1-$2");
  const channelName = eventType;

  const member = await guild.members.fetch(auditLogEntry.executorId);
  const logChannel = guild.channels.cache.find(
    (c) => c.name === channelName && c.type === ChannelType.GuildText,
  );

  if (!logChannel) return;

  const details = [
    `**Olay Türü:** ${eventType}`,
    `**Hedef:** ${target?.name || "Bilinmeyen Hedef"}`,
    `**Değişiklikler:** ${changes.map((change) => `${change.key}: ${change.old} => ${change.new}`).join(", ") || "Yok"}`,
    `**Kullanıcı:** ${member?.user.tag || "Bilinmeyen Kullanıcı"}`,
    `**Neden:** ${reason || "Neden Belirtilmemiş"}`,
  ].join("\n");

  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: member.user?.tag || "Bilinmeyen kullanıcı",
          iconURL: member.user.displayAvatarURL({ dynamic: true }),
        })
        .setFooter({
          text: "takachi was here.",
          iconURL: guild.iconURL({ dynamic: true }),
        })
        .setColor("DarkButNotBlack")
        .setDescription(details)
        .setTimestamp()
    ],
  });
});

client.login(config.Token);
