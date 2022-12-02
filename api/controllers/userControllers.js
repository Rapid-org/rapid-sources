const mongoose = require('mongoose'),
	Users = mongoose.model('users');
const admin = require('firebase-admin');
const utils = require('./utils');
const config = require('../config');
const fs = require('fs');
exports.list_users_information = function(req, res) {
	const userId = req.params.uid;
	if (!userId) {
		res.status(400).send('User id parameter wasn\'t specified.');
		return;
	}
	let token = utils.parseIdToken(req.headers);
	if (!token) {
		res.status(403).json({ error: 'No Credentials Sent!' });
		return;
	}
	utils.getUserUid(token, function(uid, error) {
		if (uid) {
          console.log(uid)
			utils.getUserByUid(uid, (user) => {
              console.log(user)
				if (user) {
					Users.find({ uid: userId }, function(err, task) {
						if (err) {
							console.log(err);
							res.send({ 'message': 'User' + userId + ' doesn\'t exist.' });
							return;
						}
						if (!task) {
							console.log('Err!');
							res.send({ 'message': 'User' + userId + ' doesn\'t exist.' });
						} else {
							console.log(task);
							res.json(task);
						}
					});
				} else {
					res.status(403).json({ error: 'No user was found with the given ID token.' });
				}
			});
		} else if (error.errorInfo.code === 'auth/id-token-expired') {
			res.status(401).json({ error: 'The ID token has expired!' });
		} else {
			res.status(403).json({ error: 'Invalid id token!' });
		}
	});
};

exports.list_users = function(req, res) {
	let page = req.params.page;
	if (!page) {
		page = 1;
	}
	let token = utils.parseIdToken(req.headers);
	if (!token) {
		res.status(403).json({ error: 'No Credentials Sent!' });
		return;
	}
	utils.getUser(token, function(uid, error) {
		if (uid) {
			console.log(uid);
			if (uid.admin) {
				utils.getUserByUid(uid.uid, (user) => {
					if (user) {
						admin.auth()
							.listUsers(100, page)
							.then((listUsersResult) => {
								const usersArr = [];
								listUsersResult.users.forEach((userRecord) => {
									usersArr.push(userRecord.toJSON());
								});
								res.status(200).json(usersArr);
							})
							.catch((error) => {
								console.log('Error listing users:', error);
							});
					} else {
						res.status(403).json({ error: 'No user was found with the given ID token.' });
					}
				});
			} else {
				res.status(403).json({error: "You don't have rights to access the requested resource."})
			}
		} else if (error.errorInfo.code === 'auth/id-token-expired') {
			res.status(401).json({ error: 'The ID token has expired!' });
		} else {
			res.status(403).json({ error: 'Invalid id token!' });
		}
	});
};

exports.delete_users = function(req, res) {
	let token = utils.parseIdToken(req.headers);
	if (!token) {
		res.status(403).json({ error: 'No Credentials Sent!' });
		return;
	}
	console.log("body", req.params.uid);
	utils.getUser(token, function(uid, error) {
		if (uid) {
			if (uid.admin) {
				utils.getUserByUid(uid.uid, (user) => {
					if (user) {
						admin.auth()
							.deleteUser(req.params.uid)
							.then(() => {
								Users.deleteOne({uid: req.params.uid}, (result) => {
									console.log("result", result);
									res.status(200).json({result: "User deleted successfully"});
								});
							})
							.catch((error) => {
								console.log("deleteuser", error);
								res.status(501).json({error: error})
								console.log('Error deleting user:', error);
							});
					} else {
						res.status(403).json({ error: 'No user was found with the given ID token.' });
					}
				});
			} else {
				res.status(403).json({error: "You don't have rights to access the requested resource."})
			}
		} else if (error.errorInfo.code === 'auth/id-token-expired') {
			res.status(401).json({ error: 'The ID token has expired!' });
		} else {
			res.status(403).json({ error: 'Invalid id token!' });
		}
	});
};

exports.admin_users = function(req, res) {
	let token = utils.parseIdToken(req.headers);
	if (!token) {
		res.status(403).json({ error: 'No Credentials Sent!' });
		return;
	}
	console.log("admin", req.body.admin)
	utils.getUser(token, function(uid, error) {
		if (uid) {
			if (uid.admin) {
				utils.getUserByUid(uid.uid, (user) => {
					if (user) {
						admin.auth()
							.setCustomUserClaims(req.params.uid, { admin: req.body.admin })
							.then(() => {
								res.status(200).json({result: "User promoted to admin successfully"});
							}).catch((error) => {
								console.log(error);
							res.status(501).json({error: error})
						});
					} else {
						res.status(403).json({ error: 'No user was found with the given ID token.' });
					}
				});
			} else {
				res.status(403).json({error: "You don't have rights to access the requested resource."})
			}
		} else if (error.errorInfo.code === 'auth/id-token-expired') {
			res.status(401).json({ error: 'The ID token has expired!' });
		} else {
			res.status(403).json({ error: 'Invalid id token!' });
		}
	});
};

exports.update_user = function(req, res) {
	const id = req.params.uid;
	console.log(req.body);
	console.log(id);
	let token = utils.parseIdToken(req.headers);
	console.log("token", token);
	if (!token) {
		res.status(403).json({ error: 'No Credentials Sent!' });
		return;
	}
	utils.getUserUid(token, function(uid, error) {
		if (uid) {
			utils.getUserByUid(uid, (user) => {
				if (user) {
					Users.updateOne({ _id: id }, req.body, null, function(err, result) {
						if (err) {
							res.send(err);
							return;
						}
						if (req.body.name) {
							admin.auth().updateUser(uid, {displayName: req.body.name})
								.then(() => {
									res.send(JSON.stringify({ 'message': 'User successfully updated.' }));
								}).catch((err) => {
								res.status(500).json({ error: err.errorInfo.message });
							});
						}
						console.log(result);
					});
				} else {
					res.status(403).json({ error: 'No user was found with the given ID token.' });
				}
			});
		} else if (error.errorInfo.code === 'auth/id-token-expired') {
			res.status(401).json({ error: 'The ID token has expired!' });
		} else {
			res.status(403).json({ error: 'Invalid id token!' });
		}
	});
};


exports.update_user_photo = function(req, res) {
  const id = req.params.uid;
  let token = utils.parseIdToken(req.headers);
  console.log("token", token);
  console.log(req.file.path)
  if (!token) {
    res.status(403).json({ error: 'No Credentials Sent!' });
    return;
  }
  utils.getUserUid(token, function(uid, error) {
    if (uid) {
      utils.getUserByUid(uid, (user) => {
        if (user) {
          fs.mkdir(`${config.web.fileStorageLocation}/uploads`, { recursive: true}, function (err) {
           if (!err) {
              console.log("MKDIR sucess")
              fs.readFile(req.file.path, function(err, data) {
                if (err) {
                  res.status(500).send(err);
                  return;
                }
                console.log(data)
              fs.writeFile(`${config.web.fileStorageLocation}/uploads/${id}.png`, data, (e) => {
                if (!e) {
                  console.log("WRITE FILE SUCESS")
                  res.send(JSON.stringify({ 'message': 'Photo URL successfully updated.' }));
                } else {
                  res.status(500).send(e)
                }
              })
              })
            } else {
              res.status(500).send(err)
            }
          })
        } else {
          res.status(403).json({ error: 'No user was found with the given ID token.' });
        }
      });
    } else if (error.errorInfo.code === 'auth/id-token-expired') {
      res.status(401).json({ error: 'The ID token has expired!' });
    } else {
      res.status(403).json({ error: 'Invalid id token!' });
    }
  });
};

exports.user_photo = function(req, res) {
  const id = req.params.uid;
  let token = utils.parseIdToken(req.headers);
  console.log("token", token);
  if (!token) {
    res.status(403).json({ error: 'No Credentials Sent!' });
    return;
  }
  utils.getUserUid(token, function(uid, error) {
    if (uid) {
      utils.getUserByUid(uid, (user) => {
        if (user) {
          if (fs.existsSync(`${config.web.fileStorageLocation}/uploads/${id}.png`)) {
            res.sendFile(`${config.web.fileStorageLocation}/uploads/${id}.png`);
          } else {
            res.status(404).json({error: "No Profile Photo found for user."})
          }
        } else {
          res.status(403).json({ error: 'No user was found with the given ID token.' });
        }
      });
    } else if (error.errorInfo.code === 'auth/id-token-expired') {
      res.status(401).json({ error: 'The ID token has expired!' });
    } else {
      res.status(403).json({ error: 'Invalid id token!' });
    }
  });
};



exports.create_a_user = function(req, res) {
	admin.auth().createUser({
		email: req.body.email,
		displayName: req.body.name,
		photoURL: req.body.photoUrl,
		password: req.body.password
	}).then(user => {
		const data = req.body;
		data.uid = user.uid;
		delete data.password; // passwords aren't stored in the database
		const new_task = new Users(req.body);
		new_task.save(function(err, task) {
			if (err) {
				res.send(err);
			} else {
				res.json(task);
			}
		});
	}).catch((e) => {
		res.status(400).json({ error: e });
	});
};
