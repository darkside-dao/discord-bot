module.exports = {
	data: {
		name: 'close',
		description: 'Closes a form, turning off responses',
		options: [
			{
				name: 'form_id',
				description: 'The form\'s ID',
				type: 3,
				required: true,
				autocomplete: true
			}	
		]
	},
	usage: [
		"[form_id] - Close the given form"
	],
	async execute(ctx) {
		var id = ctx.options.get('form_id').value.toLowerCase();
		var form = await ctx.client.stores.forms.get(ctx.guildId, id);
		if(!form.id) return 'Form not found!';

		form.open = false;
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
	opPerms: ['MANAGE_FORMS'],
	guildOnly: true
}