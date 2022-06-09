const { events: EVENTS } = require(__dirname + '/../../../extras');

module.exports = {
	data: {
		name: 'add',
		description: 'Add a role to a form',
		type: 1,
		options: [
			{
				name: 'form_id',
				description: "The form's ID",
				type: 3,
				required: true,
				autocomplete: true
			},
			{
				name: 'roles',
				description: "The roles to add",
				type: 3,
				required: true
			},
			{
				name: 'event',
				description: "The event the roles should be added on",
				type: 3,
				required: true,
				choices: EVENTS.map(e => ({
					name: e,
					value: e.toUpperCase()
				}))
			}
		]
	},
	usage: [
		"[form_id] [roles] - Add roles to a form"
	],
	async execute(ctx) {
		var roles = ctx.options.resolved.roles;
		if(!roles?.size) return "Please provide at least one valid role!";
		var event = ctx.options.getString('event');
		var id = ctx.options.get('form_id').value.toLowerCase().trim();
		var form = await ctx.client.stores.forms.get(ctx.guildId, id);;
		if(!form.id) return 'Form not found!';

		if(!form.roles) form.roles = [];
		roles = JSON.stringify(roles.filter(r => !form.roles.find(x => x.id == r.id)).map(r => ({id: r.id, events: [event]})));
		form.roles = JSON.stringify(form.roles.concat(roles));

		await form.save();
		return "Form updated!";
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
}