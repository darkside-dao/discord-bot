module.exports = {
	help: () => "A little about the bot",
	usage: () => [" - Just what's on the tin"],
	execute: async (bot, msg, args) => {
	  var cfg;
	  if (msg.channel.guild)
		cfg = await bot.stores.configs.get(msg.channel.guild.id);
  
	  var pmsg = "My default prefix is `" + bot.prefix + "`";
	  if (cfg?.prefix)
		pmsg += `, and my prefix for this server is \`${cfg.prefix}\``;
	  return {
		title: "**About**",
		description:
		  "Eee! I'm Guard!\n" +
		  pmsg,
		fields: [
		  {
			name: "Creators",
			value: "[Darkside DAO](https://twitter.com/darkside_dao)",
		  },
		  { name: "Invite", value: `[Click here!](${bot.invite})`, inline: true },
		  {
			name: "Support Server",
			value: "[Click here!](https://discord.gg/KKAMqpG7r5)",
			inline: true,
		  },
		],
	  };
	},
	alias: ["abt", "a"],
  };
  