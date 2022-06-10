module.exports = {
	help: ()=> 'Bind a form reaction to the given message',
	usage: ()=> [' [form id] [channel] [message id] - Binds a form react to a message'],
	execute: async (bot, msg, args) => {
		if(!args[2]) return 'I need a form, channel, and message to work with!';

		try {
			var form = await bot.stores.forms.get(msg.channel.guild.id, args[0].toLowerCase());
			if(!form.id) return 'Form not found!';
			var channel = msg.channel.guild.channels.cache.find(c => [c.name, c.id].includes(args[1].toLowerCase().replace(/[<@#>]/g, '')));
			if(!channel) return 'Channel not found!';
			var message = await channel.messages.fetch(args[2]);
			if(!message) return 'Message not found!';
			
			var post = await bot.stores.formPosts.get(msg.channel.guild.id, channel.id, message.id);
			if(post?.id && !post.bound) return 'That is a dedicated post and cannot be bound to!';
			post = (await bot.stores.formPosts.getByMessage(msg.channel.guild.id, message.id))
				   ?.find(p => p.form.emoji == form.emoji);
			if(post?.id) return 'Form with that emoji already bound to that message!';

			await bot.stores.formPosts.create(msg.channel.guild.id, channel.id, message.id, {
				form: form.hid,
				bound: true
			});
			message.react(form.emoji || '📝');
		} catch(e) {
			return 'ERR! '+(e.message || e);
		}

		return 'Bound!';
	},
	permissions: ['MANAGE_MESSAGES'],
	opPerms: ['MANAGE_FORMS'],
	guildOnly: true
}