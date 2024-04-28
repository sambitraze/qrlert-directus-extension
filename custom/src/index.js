const admin = require("firebase-admin");
var serviceAccount = require("./creds.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});
export default (router) => {
	router.get('/', (req, res) => res.send('Hello, World!'));
	router.post('/subscribe', async (req, res) => {
		if (req.accountability.role === 'fa539eb9-71d9-453c-bfe3-140ed9c660fd') {
			if (req.body.token !== undefined || req.body.token !== null) {
				const resp = await admin
					.messaging()
					.subscribeToTopic(req.body.token, 'admin');
				res.json({
					"response": resp,
				});
			}else{
				res.status(400).json({
					"response": "token is required"
				})
			}
		}else{			
			res.status(401).json({
				"response": "unauthorized"
			})
		}
	});
};
