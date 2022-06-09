module.exports = {
  data: {
    name: "about",
    description: "Info about the bot",
  },
  usage: ["- Gives info about the bot"],
  async execute(ctx) {
    return {
      embeds: [
        {
          title: "**About**",
          description:
            "I'm Darkside Guard! I help people with management to Discord groups!",
          fields: [
            {
              name: "Creators",
              value: "[Darkside DAO](https://github.com/darkside_dao)",
              inline: true,
            },
            {
              name: "Darkside DAO Official Server",
              value: "[Click here!](https://discord.gg/KKAMqpG7r5)",
              inline: true,
            },
            {
              name: "Invite",
              value: `[Click here!](${process.env.INVITE})`,
            },

            {
              name: "Stats",
              value: `Guilds: ${ctx.client.guilds.cache.size} | Users: ${ctx.client.users.cache.size}`,
            },
          ],
        },
      ],
    };
  },
  ephemeral: true,
};
