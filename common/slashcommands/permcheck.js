const { requiredPerms: REQUIRED } = require('../extras');

module.exports = {
	data: {
		name: "permcheck",
		description: "Check to see if the bot's permissions are set up correctly",
		options: [{
			name: 'channel',
			description: "A channel to check permissions of",
			type: 7,
			channel_types: [0],
			required: false
		}]
	},
	usage: [
		"[channel] - Check a specific channel for proper permissions"
	],
	async execute(ctx) {
		var chan = ctx.options.getChannel('channel');

		if(chan) {
			return [{
				title: "Check Results",
				description: `Channel: <#${chan.id}>`,
				fields: readout(ctx.client, chan)
			}]
		}
		
		var forms = await ctx.client.stores.forms.getAll(ctx.guild.id);
		var cfg = await ctx.client.stores.configs.get(ctx.guild.id);
		if(!forms?.length && !cfg.response_channel) return "No forms or config to check! Provide a channel to check that";

		var check = [];
		if(cfg.response_channel) check.push(cfg.response_channel);
		for(var f of forms) {
			if(f.channel_id && !check.includes(f.channel_id))
				check.push(f.channel_id);
		}

		var res = [];
		for(var c of check) {
			var ch = ctx.guild.channels.resolve(c);
			if(!ch) {
				res.push({
					title: "Check Results",
					description: `Channel: <#${c}>\n` +
						`**Can't view channel or channel doesn't exist**`
				})
				continue;
			}

			res.push({
				title: "Check Results",
				description: `Channel: <#${c}>`,
				fields: readout(ctx.client, ch)
			})
		}

		if(res.length > 1) for(var i = 0; i < res.length; i++)
			res[i].title += ` (page ${i+1}/${res.length})`;
		return res;
	},
	permissions: ['MANAGE_MESSAGES'],
	guildOnly: true
}

function readout(bot, chan) {
	var perms = chan.permissionsFor(bot.user.id).serialize();
	var fields = [
		{
			name: "Given permissions",
			value: ""
		},
		{
			name: "Missing permissions",
			value: ""
		}
	]
	
	for(var k of REQUIRED) {
		if(perms[k]) fields[0].value += `${k}\n`;
		else fields[1].value += `${k}\n`;
	}

	fields = fields.map(f => {
		f.value = f.value || "(none)";
		return f;
	})
	return fields;
}