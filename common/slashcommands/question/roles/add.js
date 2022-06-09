const { qTypes: TYPES } = require('../../../extras');

module.exports = {
	data: {
		name: 'add',
		description: "Attach roles to questions on a form",
		type: 1,
		options: [
			{
				name: 'form',
				description: "The form to change",
				type: 3,
				required: true,
				autocomplete: true
			},
			{
				name: 'question',
				description: "The question number to change",
				type: 4,
				required: true
			},
			{
				name: 'role',
				description: "The role to attach to the question",
				type: 8,
				required: true
			}
		]
	},
	usage: [
		"[form] [question] [role] - Open a menu to see the available choices and attach a role to one",
		"[form] [question] [role] [choice] - Skip the menu and attach a role to a specific chocie"
	],
	extra: "Roles are added when the response is accepted",
	async execute(ctx) {
		var f = ctx.options.getString('form')?.toLowerCase().trim();
		var q = ctx.options.getInteger('question');
		var c = ctx.options.getInteger('choice');
		var r = ctx.options.getRole('role');

		var form = await ctx.client.stores.forms.get(ctx.guild.id, f);
		if(!form) return 'Form not found!';

		if(q === 0) q = 1;
		if(q > form.questions.length) q = form.questions.length;
		var question = form.questions[q - 1];
		if(!TYPES[question.type].roleSetup)
			return "Invalid question! You can only attach roles to certain question types";

		question = await TYPES[question.type].roleSetup({
			ctx,
			question,
			role: r
		});
		if(typeof question == 'string') return question;
		form.questions[q - 1] = question;

		await form.save()
		return "Question updated!";
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