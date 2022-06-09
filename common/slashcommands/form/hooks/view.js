module.exports = {
	data: {
		name: 'view',
		description: "View a form's existing hooks",
		type: 1,
		options: [{
			name: 'form_id',
			description: "The form's ID",
			type: 3,
			required: true,
			autocomplete: true
		}]
	},
	usage: [
		"[form_id] - View hooks on a form"
	],
	async execute(ctx) {
		var id = ctx.options.get('form_id').value.toLowerCase().trim();
		var form = await ctx.client.stores.forms.get(ctx.guildId, id);;
		if(!form.id) return 'Form not found!';

		var hooks = await ctx.client.stores.hooks.getByForm(ctx.guildId, form.hid);
		if(!hooks?.[0]) return "No hooks for that form!";

		return hooks.map(h => {
			return {
				title: `Hook ${h.hid}`,
				description: `Belongs to form ${form.hid}`,
				fields: [
					{name: 'URL', value: h.url},
					{name: 'Events', value: h.events.join(', ')}
				]
			}
		})
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
	ephemeral: true
}