module.exports = {
	help: ()=> 'Post a form to the given channel',
	usage: ()=> [' [form id] [channel] - Post a form to a channel'],
	execute: async (bot, msg, args) => {
		if(!args[1]) return 'I need a form and channel to work with!';

		var form = await bot.stores.forms.get(msg.channel.guild.id, args[0].toLowerCase());
		if(!form.id) return 'Form not found!';
		var channel = msg.channel.guild.channels.cache.find(c => [c.name, c.id].includes(args[1].toLowerCase().replace(/[<@#>]/g, '')));
		if(!channel) return 'Channel not found!';

		var responses = await bot.stores.responses.getByForm(msg.channel.guild.id, form.hid);
		try {
			var message = await channel.send({embeds: [{
				title: form.name,
				description: form.description,
				color: parseInt(!form.open ? 'aa5555' : form.color || '55aa55', 16),
				fields: [{name: 'Response Count', value: responses?.length.toString() || '0'}],
				footer: {
					text: `Form ID: ${form.hid} | ` +
						  (!form.open ?
						  'this form is not accepting responses right now!' :
						  'react below to apply to this form!')
				}
			}]});
			message.react(form.emoji || '📝');
			await bot.stores.formPosts.create(msg.channel.guild.id, channel.id, message.id, {
				form: form.hid
			});
		} catch(e) {
			return 'ERR! '+(e.message || e);
		}

		return 'Posted!';
	},
	permissions: ['MANAGE_MESSAGES'],
	opPerms: ['MANAGE_FORMS'],
	guildOnly: true
}