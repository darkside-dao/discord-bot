module.exports = {
	help: ()=> 'Rename a form',
	usage: ()=> [' [form id] [new name] - Rename the given form'],
	execute: async (bot, msg, args) => {
		if(!args[1]) return 'I need a form and a new name!';

		var form = await bot.stores.forms.get(msg.channel.guild.id, args[0].toLowerCase());
		if(!form) return 'Form not found!';

		try {
			form.name = args.slice(1).join(' ');
			await form.save()
		} catch(e) {
			if(e.message) return 'ERR! '+e.message;
			else if(typeof e == 'string') return 'ERR! '+e;
			else return 'ERRS!\n'+e.join('\n');
		}

		return 'Form renamed!';
	},
	alias: ['name', 'rn'],
	permissions: ['MANAGE_MESSAGES'],
	opPerms: ['MANAGE_FORMS'],
	guildOnly: true
}