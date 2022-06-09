const OPTIONS = require(__dirname + '/../../extras').options;

module.exports = {
	help: () => 'Duplicates an existing form',
	usage: () => [
		' [form id] - Runs menu to duplicate the given form',
		' [form id] [options list] - Specifies what to copy between the forms'
	],
	desc: ()=> [
		"Options list:",
		'```',
		OPTIONS.map(o => `${o.alias.join(" | ")} - ${o.desc}`).join(""),
		'```',
		"(Questions are always copied!)"
	].join("\n"),
	execute: async (bot, msg, args) => {
		if(!args[0]) return "I need a form ID to duplicate!";

		var form = await bot.stores.forms.get(msg.channel.guild.id, args[0].toLowerCase());
		if(!form.id) return "Form not found!";

		var resp;
		if(args[1]) resp = args.slice(1).join(" ").toLowerCase().split(/,?\s+/g);
		else {
			await msg.channel.send(
				`What would you like to copy?\n\n` +
				`**OPTIONS**\n` +
				`*Table format: [option | alt name | etc] - [description]*\n` +
				'```\n' +
				OPTIONS.map(o => `${o.alias.join(" | ")} - ${o.desc}\n`).join("") +
				'```\n' +
				`Type a list of what you want to copy below! Note that questions are copied by default\n` +
				`Type anything not on the list to continue with the process and only copy questions`
			)

			var resp = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 60000});
			if(!resp || !resp.first()) return "ERR! No response!";
			resp = resp.first().content.toLowerCase().split(/,?\s+/g);
		}
			
		resp = resp.map(o => OPTIONS.find(op => op.alias.includes(o))?.val)
				   .filter((x, i, arr) => x && arr.indexOf(x, i + 1) == -1); //de-duplicate, grab correct options

		var data = {};
		resp.forEach(o => data[o] = form[o]);
		
		data.name = data.name || "Untitled";
		data.description = data.description || "*no description*";
		data.questions = form.questions;

		try {
			var created = await bot.stores.forms.create(msg.channel.guild.id, data);
		} catch(e) {
			return 'ERR! '+e;
		}

		return [
			`Form copied! ID: ${created.hid}`,
			`Use \`${bot.prefix}channel ${created.hid}\` to change what channel this form's responses go to!`,
			`See \`${bot.prefix}h\` for more customization commands`	
		].join('\n');
	},
	alias: ['copy', 'dup', 'cp'],
	permissions: ['MANAGE_MESSAGES'],
	opPerms: ['MANAGE_FORMS'],
	guildOnly: true
}
