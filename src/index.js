const { ShardingManager } = require('discord.js');
require('dotenv/config');
const { join } = require('node:path');

const manager = new ShardingManager(join(__dirname, 'bot.js'), {
  token: process.env.TOKEN,
  execArgv: process.env.execArgv
});

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();