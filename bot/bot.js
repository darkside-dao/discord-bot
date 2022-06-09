const { Client, Intents, Options } = require("discord.js");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const bot = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  ],
  partials: ["MESSAGE", "USER", "CHANNEL", "GUILD_MEMBER", "REACTION"],
  makeCache: Options.cacheWithLimits({
    MessageManager: 0,
    ThreadManager: 0,
  }),
});

bot.prefix = process.env.PREFIX;
bot.chars = process.env.CHARS;
bot.invite = process.env.INVITE;

bot.tc = require("tinycolor2");

bot.status = 0;
bot.guildCount = 0;
bot.statuses = [
  () => `Use ! | in ${bot.guilds.cache.size} guilds!`,
  () => `Use ! | serving ${bot.users.cache.size} users!`,
];

bot.updateStatus = async function () {
  var target = bot.statuses[bot.status % bot.statuses.length];
  if (typeof target == "function") bot.user.setActivity(await target());
  else bot.user.setActivity(target);
  bot.status++;

  setTimeout(() => bot.updateStatus(), 60 * 1000); // 5 mins
};

async function setup() {
  bot.db = await require(__dirname + "/../common/stores/__db")(bot);

  files = fs.readdirSync(__dirname + "/events");
  files.forEach((f) =>
    bot.on(f.slice(0, -3), (...args) =>
      require(__dirname + "/events/" + f)(...args, bot)
    )
  );

  bot.handlers = {};
  files = fs.readdirSync(__dirname + "/handlers");
  files.forEach(
    (f) =>
      (bot.handlers[f.slice(0, -3)] = require(__dirname + "/handlers/" + f)(
        bot
      ))
  );

  bot.utils = require(__dirname + "/utils");
  Object.assign(bot.utils, require(__dirname + "/../common/utils"));
}

bot.writeLog = async (log) => {
  let now = new Date();
  let ndt = `${
    (now.getMonth() + 1).toString().length < 2
      ? "0" + (now.getMonth() + 1)
      : now.getMonth() + 1
  }.${
    now.getDate().toString().length < 2 ? "0" + now.getDate() : now.getDate()
  }.${now.getFullYear()}`;
  if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");
  if (!fs.existsSync(`./logs/${ndt}.log`)) {
    fs.writeFile(`./logs/${ndt}.log`, log + "\r\n", (err) => {
      if (err)
        console.log(`Error while attempting to write log ${ndt}\n` + err.stack);
    });
  } else {
    fs.appendFile(`./logs/${ndt}.log`, log + "\r\n", (err) => {
      if (err)
        console.log(`Error while attempting to apend to log ${ndt}\n` + err);
    });
  }
};

bot.on("ready", async () => {
  console.log("Darkside Guard is ready!");
  bot.updateStatus();
});

bot.on("error", (err) => {
  console.log(`Error:\n${err.stack}`);
  bot.writeLog(`=====ERROR=====\r\nStack: ${err.stack}`);
});

process.on("unhandledRejection", (e) => console.log(e));

setup();
bot
  .login(process.env.TOKEN)
  .catch((e) => console.log("Trouble connecting...\n" + e));
