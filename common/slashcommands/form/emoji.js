const { clearBtns } = require('../../extras');

module.exports = {
	data: {
		name: 'emoji',
		description: "Changes a form's emoji",
		options: [
			{
				name: 'form_id',
				description: 'The form\'s ID',
				type: 3,
				required: true,
				autocomplete: true
			},
			{
				name: 'emoji',
				description: 'The emoji to use for binding reacts. Omit to view/clear current value',
				type: 3,
				required: false
			}
		]
	},
	usage: [
		"[form_id] - View and optionally reset a form's emoji",
		"[form_id] [emoji] - Set a form's emoji"
	],
	async execute(ctx) {
		var id = ctx.options.get('form_id').value.toLowerCase().trim();
		var e = ctx.options.get('emoji')?.value;
		var form = await ctx.client.stores.forms.get(ctx.guildId, id);;
		if(!form.id) return 'Form not found!';

		if(!e) {
			if(!form.emoji) return 'Form uses the default emoji! 📝';

			var v = form.emoji.includes(':') ? `<:${form.emoji}:>` : form.emoji;
			var rdata = {
				embeds: [
					{
						description: `Current emoji: **${v}**`,
					}
				],
				components: [
					{
						type: 1,
						components: clearBtns
					}
				]
			}
			await ctx.reply(rdata);

			var reply = await ctx.fetchReply();
			var conf = await ctx.client.utils.getConfirmation(ctx.client, reply, ctx.user);
			var msg;
			if(conf.msg) {
				msg = conf.msg;
			} else {
				form.emoji = null;
				await form.save()
				msg = 'Emoji reset!';
			}

			return msg;
		}
		
		var emoji = e.includes(':') ? e.replace(/<:(.*):>/, '$1') : e;

		form.emoji = emoji;
		await form.save()
		return 'Form updated!';
	},
	async auto(ctx) {
		var forms = await ctx.client.stores.forms.getAll(ctx.guild.id);
		var foc = ctx.options.getFocused();
		if(!foc) return forms.map(f => ({ name: f.name, value: f.hid }));
		foc = foc.toLowerCase()

		if(!forms?.length) return [];

		return forms.filter(f =>
			f.hid.includes(foc) ||
			f.name.toLowerCase().includes(foc) ||
			f.description.toLowerCase().includes(foc)
		).map(f => ({
			name: f.name,
			value: f.hid
		}))
	},
	permissions: ['MANAGE_MESSAGES'],
	guildOnly: true
}