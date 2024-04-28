const admin = require("firebase-admin");
var serviceAccount = require("./creds.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
}, "bb");
const sendTopicNotification = async (title, body, data) => {
	console.log(
		" ------------------------------------ sendTopicNotification ------------------------------------"
	);
	try {
		let payload = {
			notification: {
				title: title,
				body: body,
			},
			data: data,
		};
		var options = {
			priority: "high",
			timeToLive: 60 * 60 * 24,
		};
		const response = await admin
			.messaging()
			.sendToTopic("admin", payload, options);
		console.log("response", response);
	} catch (error) {
		console.log(error);
	}
};

export default ({ action, filter, schedule }, { services, getSchema }) => {
	const { ItemsService } = services;
	action('Students.items.update', async (meta, { schema, accountability }) => {
		if (!("last_download" in meta.payload)) {
			// console.log('------------------------------------accountability ------------------------------------');
			// console.log(accountability);
			// console.log('------------------------------------ Post created! ------------------------------------');
			const NotificationCollection = new ItemsService("notification", {
				accountability: accountability,
				schema: schema,
			});
			const TriggeredCollection = new ItemsService('Students', {
				accountability: accountability,
				schema: schema,
			});
			// console.log('------------------------------------ Item meta! ------------------------------------');
			// console.log(meta);
			const createdObject = await TriggeredCollection.readOne(meta.keys[0], {
				fields: ["*"],
			});;
			// console.log('------------------------------------ fetch item! ------------------------------------');
			// console.log(JSON.stringify(createdObject, null, 4));
			const title = `Student data for ${createdObject.full_name} has been updated!`;
			const body = 'Data Updated';
			// console.log('------------------------------------ notify obj! ------------------------------------');
			const obj = {
				title: title,
				body: body,
				object_type: "student",
				// target: "all",
				// reference_user: createdObject.user_created.id,
				refrence_object_id: createdObject.id,
			}
			// console.log(obj);
			// console.log('------------------------------------ trigger nootify ------------------------------------');
			await NotificationCollection.createOne(obj);
			await sendTopicNotification(title, body, {
				"object_type": "student",
				"refrence_object_id": createdObject.id,
			});
		}

	});
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
