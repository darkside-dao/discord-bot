const WELCOMES = [
  "You're welcome!",
  "You're welcome! :black_heart:",
  "Of course!!",
  ":D !!",
  "Eee! :black_heart:",
];

module.exports = async (msg, bot) => {
  if (msg.author.bot) return;
  var config = await bot.stores.configs.get(msg.channel.guild?.id);
  var prefix = (config?.prefix ? config.prefix : bot.prefix).toLowerCase();
  if (!msg.content.toLowerCase().startsWith(prefix)) {
    var thanks = msg.content.match(
      /^(thanks? ?(you|u)?|ty),? ?((darkside )?(dao))/i
    );
    if (thanks)
      return await msg.channel.send(
        WELCOMES[Math.floor(Math.random() * WELCOMES.length)]
      );
    return;
  }
  if (msg.content.toLowerCase() == prefix) return msg.channel.send("Eee!");

  // level system
  var lvlup;
  try {
    lvlup = await bot.stores.profiles.handleExperience(msg.author.id);
  } catch (e) {
    await msg.channel.send(e);
  }
  if (lvlup.message)
    await msg.channel.send(lvlup.message.replace("$USER", msg.author.username));

  var log = [
    `Guild: ${msg.channel.guild?.name || "DMs"} (${
      msg.channel.guild?.id || msg.channel.id
    })`,
    `User: ${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
    `Message: ${msg.content}`,
    `--------------------`,
  ];

  var content = msg.content.slice(prefix.length);
  let { command, args } = await bot.handlers.command.parse(content);
  if (!command) {
    log.push("- Command not found -");
    console.log(log.join("\r\n"));
    bot.writeLog(log.join("\r\n"));
    return await msg.channel.send("Command not found!");
  }

  try {
    var result = await bot.handlers.command.handle({
      command,
      args,
      msg,
      config,
    });
  } catch (e) {
    console.log(e);
    log.push(`Error: ${e}`);
    log.push(`--------------------`);
    msg.channel.send("There was an error!");
  }
  console.log(log.join("\r\n"));
  bot.writeLog(log.join("\r\n"));

  if (!result) return;
  if (Array.isArray(result)) {
    //embeds
    var message = await msg.channel.send({
      embeds: [result[0].embed ?? result[0]],
    });
    if (result[1]) {
      if (!bot.menus) bot.menus = {};
      bot.menus[message.id] = {
        user: msg.author.id,
        data: result,
        index: 0,
        timeout: setTimeout(() => {
          if (!bot.menus[message.id]) return;
          try {
            message.reactions.removeAll();
          } catch (e) {
            console.log(e);
          }
          delete bot.menus[message.id];
        }, 900000),
        execute: bot.utils.paginateEmbeds,
      };
      ["⬅️", "➡️", "⏹️"].forEach((r) => message.react(r));
    }
  } else if (typeof result == "object") {
    if (result.embed || result.title)
      await msg.channel.send({ embeds: [result.embed ?? result] });
    else await msg.channel.send(result);
  } else await msg.channel.send(result);
};
