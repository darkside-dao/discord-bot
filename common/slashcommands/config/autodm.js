const { clearBtns } = require('../../extras');

module.exports = {
	data: {
		name: 'autodm',
		description: "Sets a form to automatically DM to a user when they join",
		options: [
			{
				name: 'form_id',
				description: 'The form\'s ID',
				type: 3,
				required: false,
				autocomplete: true
			}
		]
	},
	usage: [
		"- View and optionally clear the auto-DM'd form",
		"[form_id] - Set the form to auto-DM"
	],
	extra: "NOTE: This feature may not work until the bot " +
		   "has been whitelisted for the members intent!",
	async execute(ctx) {
		var cfg = await ctx.client.stores.configs.get(ctx.guild.id);
		var id = ctx.options.getString('form_id')?.toLowerCase().trim();

		var form;
		if(!id) {
			if(!cfg?.autodm) return 'No form set!';
			form = await ctx.client.stores.forms.get(ctx.guildId, cfg.autodm);
			if(!form.id) return `Currently set form (${cfg.autodm}) is invalid or no longer exists!`;

			var rdata = {
				embeds: [
					{
						description: `Current form: **${form.name}** (${form.hid})`
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
				cfg.autodm = null;
				msg = 'Form cleared!';
			}

			await cfg.save();
			return msg;
		}
		
		form = await ctx.client.stores.forms.get(ctx.guildId, id);
		if(!form.id) return 'Form not found!';

		cfg.autodm = form.hid;
		await cfg.save()
		return 'Config updated!';
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