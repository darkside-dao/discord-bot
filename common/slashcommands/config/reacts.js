module.exports = {
	data: {
		name: "reacts",
		description: "Change if the user's reaction is removed when applying to a form",
		options: [
			{
				name: 'value',
				description: 'The value for whether the react is removed',
				type: 5,
				required: true
			},
			{
				name: 'form_id',
				description: "ID of a form to change",
				type: 3,
				required: false
			}
		]
	},
	usage: [
		"[value] - Set the default value for all forms",
		"[value] [form_id] - Set the value for a form"
	],
	extra: "Set this to FALSE to stop the bot from removing users' reacts on form posts",
	async execute(ctx) {
		var val = ctx.options.getBoolean('value');
		var farg = ctx.options.get('form_id')?.value.toLowerCase().trim();

		if(farg) {
			var form = await ctx.client.stores.forms.get(ctx.guildId, farg);
			if(!form.id) return 'Form not found!';

			form.reacts = val;
			await form.save()
			return "Form updated!";
		}

		var cfg = await ctx.client.stores.configs.get(ctx.guildId);
		cfg.reacts = val;
		await cfg.save()
		
		return "Config updated!";
	}
}