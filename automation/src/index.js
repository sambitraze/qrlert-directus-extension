export default ({ filter, schedule }, { services, getSchema }) => {
	const { ItemsService } = services;
	filter('users.update', async (payload, meta, context) => {
		if (payload.hasOwnProperty('password')) {
			payload.pin = payload.password;
		}
		return payload;
	});
	schedule('0 0 * * *', async () => {
		console.log("2 min passed");
		const schema = await getSchema();
		const classesCollection = new ItemsService("classes", {
			schema,
		});
		const res = await classesCollection.updateByQuery(
			{ filter: { attendance_taken: true } }, {
			"attendance_taken": false,
			"attendance_stats": "N/A"
		}
		)
		console.log("Res: ", res)
	});
};
