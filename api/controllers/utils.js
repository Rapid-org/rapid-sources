const admin = require('firebase-admin');
const mongoose = require('mongoose');
Users = mongoose.model('users')

exports.parseIdToken = function (headers) {
	let token = headers.authorization;
	if (!token) {
		return null;
	}
	return token.replace('Bearer ', '');
}

exports.getUserUid = function (token, callback) {
	admin.auth()
		.verifyIdToken(token)
		.then((decodedToken) => {
			const uid = decodedToken.uid;
			callback(uid, null);
		}).catch((error) => {
		callback(null, error);
	});
}

exports.getUser = function (token, callback) {
	admin.auth()
		.verifyIdToken(token)
		.then((decodedToken) => {
			callback(decodedToken, null);
		}).catch((error) => {
		callback(null, error);
	});
}

exports.getUserByUid = function (uid, callback) {
	Users.findOne({ uid: uid }).then(function(task) {
		if (task) {
			callback(task);
		} else {
			callback(null);
		}
	});
}