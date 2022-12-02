const mongoose = require('mongoose'),
	Projects = mongoose.model('projects');
Users = mongoose.model('users');
const fs = require('fs');
const config = require('./../config');
const { readdir, stat } = require('fs/promises');
const { join } = require('path');
const JSZip = require('jszip');
const archiver = require('archiver');
const utils = require('./utils');
const pricingPlans = require('./pricingplans');
const streamBuffers = require('stream-buffers');
const zip = require('archiver/lib/plugins/json');

exports.list_all_projects = function(req, res) {
	const userId = req.params.id;
	if (!userId) {
		res.status(400).send('No user ID was provided');
		return;
	}
	let token = utils.parseIdToken(req.headers);
	if (!token) {
		res.status(403).json({ error: 'No Credentials Sent!' });
		return;
	}
	utils.getUserUid(token, function(uid, error) {
		if (uid) {
			utils.getUserByUid(uid, (user) => {
				if (user && (userId === user._id.toString())) {
					Projects.find({ 'userId': userId }, function(err, task) {
						if (err) {
							res.send(err);
						} else {
							res.json(task);
						}
					});
				} else {
					res.status(403).json({ error: 'You don\'t have access to this user.' });
				}
			});
		} else if (error.errorInfo.code === 'auth/id-token-expired') {
			res.status(401).json({ error: 'The ID token has expired!' });
		} else {
			res.status(403).json({ error: 'Invalid id token!' });
		}
	});
};

exports.find_project = function(req, res) {
	let token = utils.parseIdToken(req.headers);
	if (!token) {
		res.status(403).json({ error: 'No Credentials Sent!' });
		return;
	}
	utils.getUserUid(token, function(uid, error) {
		if (uid) {
			utils.getUserByUid(uid, (user) => {
				if (user) {
					Projects.findOne({ _id: req.params.id, userId: user._id.toString() }, (err, task) => {
						if (task) {
							const info = task;
							res.sendFile(config.web.fileStorageLocation + '/' + user._id + '/' + info._id + '/' + info.name + '.rbx', function(e) {
								if (!e) {
									console.log('File sent!');
								}
							});
						} else {
							res.json(err);
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

exports.create_a_project = function(req, res) {
	let token = utils.parseIdToken(req.headers);
	if (!token) {
		res.status(403).json({ error: 'No Credentials Sent!' });
		return;
	}
	utils.getUser(token, function(uid, error) {
		if (uid) {
			utils.getUserByUid(uid.uid, (user) => {
				if (user) {
					Projects.findOne({ name: req.body.name, userId: user._id.toString() }, (err, task) => {
						if (task) {
							res.status(409).send('A project with the same name already exists.');
						} else {
                              req.body.packageName = pricingPlans.getPricingPlanPackageName(uid.plan, req.body.name, req.body.packageName, user.name)
                              const new_task = new Projects(req.body);
                              console.log("new_task", new_task)
                              new_task.save().then((task, err) => {
                                if (err) {
                                  res.send(err);
                                } else {
                                  // save project on server
                                  createZipForProject(task, (function(content, err) {
                                    console.log("createproejct", err)
                                    if (!err) {
                                      doUpdateProject(Buffer.from(content, 'binary'), task._id, task.userId, uid.plan,function(err) {
                                        console.log("doupdateproject",err)
                                        if (err) {
                                          if (err.error && err.error.toString().toLowerCase().includes("cloud storage")) {
                                            res.status(413).json(err);
                                            return
                                          } else {
                                            res.status(400).json(err);
                                            return;
                                          }
                                        }
                                        res.json(task)
                                      });
                                    } else {
                                      console.log(err);
                                      res.status(400).json(err);
                                    }
                                  }));
                                }
                          })
						}
					});
				} else {
					res.status(403).json({ error: 'You don\'t have access to this project.' });
				}
			});
		} else if (error.errorInfo.code === 'auth/id-token-expired') {
			res.status(401).json({ error: 'The ID token has expired!' });
		} else {
			res.status(403).json({ error: 'Invalid id token!' });
		}
	});
};

exports.import_project = function(req, res) {
	let token = utils.parseIdToken(req.headers);
	if (!token) {
		res.status(403).json({ error: 'No Credentials Sent!' });
		return;
	}
	utils.getUser(token, function(uid, error) {
		if (uid) {
			utils.getUserByUid(uid.uid, (user) => {
				if (user) {
                  let zipp;
                  let extensionObj;
                  fs.readFile(req.file.path, function (err, fileBuffer) {
                    JSZip.loadAsync(fileBuffer).then((zip) => {
                      zipp = zip;
                      return zip.files['extension.json'].async('text');
                    }).then(function(extensionJson) {
                      console.log(extensionJson)
                      extensionObj = JSON.parse(extensionJson);
                      return zipp.files['src/main/blocks/' + extensionObj.name + '.xml'].async('text');
                    }).then(function(blocksXml) {
                      extensionObj.blocks = blocksXml;
                      return zipp.files['classes.json'].async('text');
                    }).then(function(classes) {
                      console.log(classes)
                      extensionObj.classes = classes;
                      Projects.findOne({ name: extensionObj.name, userId: user._id.toString() }, (err, task) => {
                        if (task) {
                          res.status(409).send('A project with the same name already exists.');
                        } else {
                              const new_task = new Projects({
                                userId: user._id,
                                name: extensionObj.name,
                                description: extensionObj.description,
                                packageName: extensionObj.packageName
                              });
                              new_task.save().then((task, err) => {
                                console.log("import project task ", task);
                                if (err) {
                                  res.send(err);
                                } else {
                                  // save project on server
                                  createZipForProject(extensionObj, (function(content, err) {
                                    console.log("createzip", err);
                                    if (!err) {
                                      doUpdateProject(Buffer.from(content, 'binary'), task._id, task.userId, uid.plan, function(err) {
                                        console.log("doupdate", err);
                                        if (!err) {
                                          res.json(task);
                                        } else {
                                          // that's a fatal, we created the project but we were not able to save it on our server
                                          res.json(err);
                                        }
                                      });
                                    } else {
                                      console.log(err);
                                      res.status(400).json(err);
                                    }
                                  }));
                                }
                          });
                        }
                      });
                    });
                  });
				} else {
					res.status(403).json({ error: 'You don\'t have access to this project.' });
				}
			});
		} else if (error.errorInfo.code === 'auth/id-token-expired') {
			res.status(401).json({ error: 'The ID token has expired!' });
		} else {
			res.status(403).json({ error: 'Invalid id token!' });
		}
	});
};

exports.delete_project = function(req, res) {
	let token = utils.parseIdToken(req.headers);
	if (!token) {
		res.status(403).json({ error: 'No Credentials Sent!' });
		return;
	}
	utils.getUserUid(token, function(uid, error) {
		if (uid) {
			utils.getUserByUid(uid, function(user) {
				if (user) {
					getProjectByUser(user, function(project) {
						if (project) {
							const id = req.params.id;
							deleteFolderRecursive(config.web.fileStorageLocation + `/${user._id}/${id}`); // delete the project directory.
							Projects.deleteOne({ _id: id }).then(function() {
								res.json({ 'message': 'Project successfully deleted.' });
							}).catch(function(err) {
								res.json({ 'error': err });
							});
						} else {
							res.status(403).json({ error: 'You don\'t have access to this project.' });
						}
					});
				} else {
					res.status(403).json({ error: 'No user was found with the given ID token.' });
				}
			});
		} else if (error.errorInfo.code === 'auth/id-token-expired') {
			res.status(401).json({ error: 'The ID token has expired!' });
		} else {
			res.status(403).json({ error: 'Invalid Id token.' });
		}
	});
};

var deleteFolderRecursive = function(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file) {
			var curPath = path + '/' + file;
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};

function getProjectByUser(user, callback) {
	Projects.findOne({ userId: user._id.toString() }).then(function(task) {
		callback(task);
	});
}

exports.update_project = function(req, res) {
	const id = req.params.id;
	let token = utils.parseIdToken(req.headers);
	if (!token) {
		res.status(403).json({ error: 'No Credentials Sent!' });
		return;
	}
	utils.getUser(token, function(uid, error) {
		if (uid) {
			utils.getUserByUid(uid.uid, function(user) {
				if (user) {
                  console.log("plan", uid.plan)
					Projects.findOne({ userId: user._id.toString(), id: id }, function(err, task) {
						if (!task || (task && task.length === 0)) {
							res.status(403).send({ error: 'You don\'t have access to this project.' });
						} else {
                          fs.readFile(req.file.path, function(err, fileBuffer) {
                            doUpdateProject(fileBuffer, id, task.userId, uid.plan, (e) => {
                              if (e) {
                                if (e.error && e.error.toString().toLowerCase().includes("cloud storage")) {
                                  res.status(413).json(e);
                                  return;
                                } else {
                                  res.status(400).json(e);
                                  return;
                                }
                              }
                              res.send(JSON.stringify({ 'message': 'Project successfully updated.' }));
                            });
                          });
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

function doUpdateProject(fileBuffer, id, userId, plan, callback) {
	JSZip.loadAsync(fileBuffer).then((content) => {
		return content.files['extension.json'].async('text');
	}).then((txt) => {
		console.log("txt", txt);
          const dirName = config.web.fileStorageLocation + `/${userId}/${id}`;
          if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
          }
          var projectName = JSON.parse(txt).name;
          fs.writeFile(dirName + `/${projectName}.rbx`, fileBuffer, (e) => {
            if (!e) {
              ( async () => {
                const size = await dirSize(config.web.fileStorageLocation + `/${userId}`);
                console.log(size / 1e+6);
                let limit = 40;
                console.log("plan limit", limit)
                if (limit === -1 || !((size / 1e+6) > limit)) {
                  Projects.updateOne({ _id: id, userId: userId }, {
                    updatedAt: Date.now(),
                    description: JSON.parse(txt).description
                  }, null, (e) => {
                    if (!e) {
                      callback(null);
                    } else {
                      callback(e);
                    }
                  });
                } else {
                  callback({error: "Cloud storage limit exceeded"})
                }
              } )();

            } else {
              console.log(e);
              callback(e);

            }
          });
	});
}

const dirSize = async dir => {
  const files = await readdir( dir, { withFileTypes: true } );

  const paths = files.map( async file => {
    const path = join( dir, file.name );

    if ( file.isDirectory() ) return await dirSize( path );

    if ( file.isFile() ) {
      const { size } = await stat( path );

      return size;
    }

    return 0;
  } );

  return ( await Promise.all( paths ) ).flat( Infinity ).reduce( ( i, size ) => i + size, 0 );
}

function createZipForProject(project, callback) {
	let outputStreamBuffer = new streamBuffers.WritableStreamBuffer({
		initialSize: (1000 * 1024),   // start at 1000 kilobytes.
		incrementAmount: (1000 * 1024) // grow by 1000 kilobytes each time buffer overflows.
	});
    console.log("create zip project ", project)
	let archive = archiver('zip', {
		zlib: { level: 9 } // Sets the compression level.
	});
	archive.pipe(outputStreamBuffer);
	const extensionJson = Object.assign({}, project);
	extensionJson['versionName'] = (extensionJson['versionName']) ? extensionJson['versionName'] : '1.0';
	extensionJson['versionNumber'] = (extensionJson['versionNumber']) ? extensionJson['versionNumber'] : 1;
	extensionJson['homeWebsite'] = (extensionJson['homeWebsite']) ? extensionJson['homeWebsite'] : '';
	extensionJson['minSdk'] = (extensionJson['minSdk']) ? extensionJson['minSdk'] : 7;
  extensionJson['libraries'] = (extensionJson['libraries']) ? extensionJson['libraries'] : [];
	extensionJson['name'] = (extensionJson['name']) ? extensionJson['name'] : (project._doc ? project._doc.name : project.name);
	extensionJson['packageName'] = (extensionJson['packageName']) ? extensionJson['packageName'] : (project._doc ? project._doc.packageName : project.packageName);
	extensionJson['description'] = (extensionJson['description']) ? extensionJson['description'] : (project._doc ? project._doc.description : project.description);
	delete extensionJson._id;
	delete extensionJson.userId;
	delete extensionJson.__v;
	delete extensionJson.$__;
	delete extensionJson.$isNew;
	delete extensionJson._doc;
	delete extensionJson.$errors;
	archive.append(JSON.stringify(extensionJson), { name: 'extension.json' });
	archive.append(JSON.stringify(extensionJson.classes ? extensionJson.classes : {classes: []}), { name: 'classes.json' });
	archive.append('<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n  package="com.example"\n  android:versionCode="1"          \n  android:versionName="1.0" >\n  <application>\n    <!-- Define activities, services, and content providers here-->\n  </application>\n</manifest>', { name: 'AndroidManifest.xml' });
	const javaPath = 'src/main/java/' + extensionJson.packageName.replaceAll('.', '/');
	archive.directory(javaPath, false);
	// the default project code
	archive.append('\/*\r\n * Copyright (c) 2021, <<Your Name>>\r\n * All rights reserved.\r\n *\r\n * Redistribution and use in source and binary forms, with or without\r\n * modification, are permitted provided that the following conditions are met:\r\n *\r\n * * Redistributions of source code must retain the above copyright notice, this\r\n *   list of conditions and the following disclaimer.\r\n * * Redistributions in binary form must reproduce the above copyright notice,\r\n *   this list of conditions and the following disclaimer in the documentation\r\n *   and\/or other materials provided with the distribution.\r\n *\r\n * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"\r\n * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\r\n * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\r\n * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE\r\n * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\r\n * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF\r\n * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS\r\n * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN\r\n * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)\r\n * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE\r\n * POSSIBILITY OF SUCH DAMAGE.\r\n *\/\r\npackage io.moha;\r\n\r\nimport com.google.appinventor.components.annotations.DesignerComponent;\r\nimport com.google.appinventor.components.annotations.SimpleFunction;\r\nimport com.google.appinventor.components.annotations.SimpleObject;\r\nimport com.google.appinventor.components.common.ComponentCategory;\r\nimport com.google.appinventor.components.runtime.AndroidNonvisibleComponent;\r\nimport com.google.appinventor.components.runtime.ComponentContainer;\r\n@SimpleObject(external=true)\r\n@DesignerComponent(version = 1, nonVisible = true, category = ComponentCategory.EXTENSION, iconName = "images\/extension.png", description = "", versionName = "1.0")\r\npublic class GrayLetters extends AndroidNonvisibleComponent {\r\n\r\npublic GrayLetters(ComponentContainer container) {\r\n  super(container.$form());\r\n}\r\n  \/**\r\n * Description goes here\r\n *\r\n * @param a\r\n * @param b\r\n * @return double\r\n *\/\r\n  @SimpleFunction\r\n  public double Add(double a, double b) {\r\n    return a + b;\r\n  }\r\n\r\n}\r\n\r\n', { name: javaPath + '/' + project.name + '.java' });
	const blocksPath = 'src/main/blocks/';
	archive.directory(blocksPath, false);
	archive.append((extensionJson['blocks']) ? extensionJson['blocks'] : '<xml xmlns=\"http:\/\/www.w3.org\/1999\/xhtml\">\r\n  <block type=\"procedures_definitnoreturn\" x=\"0\" y=\"0\">\r\n    <mutation>\r\n      <arg name=\"container\" type=\"ComponentContainer\"><\/arg>\r\n    <\/mutation>\r\n  <\/block>\r\n  <block type=\"procedures_deffunctionreturn\" x=\"356\" y=\"219\">\r\n    <mutation>\r\n      <arg name=\"a\" type=\"Number\"><\/arg>\r\n      <arg name=\"b\" type=\"Number\"><\/arg>\r\n    <\/mutation>\r\n    <field name=\"NAME\">Add<\/field>\r\n    <field name=\"PROCEDURE_RETURN_TYPE\">Number<\/field>\r\n    <field name=\"DESCRIPTION\"><\/field>\r\n    <value name=\"RETURN\">\r\n      <block type=\"math_arithmetic\">\r\n        <field name=\"OP\">ADD<\/field>\r\n        <value name=\"A\">\r\n          <shadow type=\"math_number\">\r\n            <field name=\"NUM\">1<\/field>\r\n          <\/shadow>\r\n          <block type=\"variables_get\">\r\n            <field name=\"VAR\">a<\/field>\r\n          <\/block>\r\n        <\/value>\r\n        <value name=\"B\">\r\n          <shadow type=\"math_number\">\r\n            <field name=\"NUM\">1<\/field>\r\n          <\/shadow>\r\n          <block type=\"variables_get\">\r\n            <field name=\"VAR\">b<\/field>\r\n          <\/block>\r\n        <\/value>\r\n      <\/block>\r\n    <\/value>\r\n  <\/block>\r\n<\/xml>', { name: blocksPath + '/' + project.name + '.xml' });
	archive.finalize();
	outputStreamBuffer.on('finish', () => {
		// Do something with the contents here
		outputStreamBuffer.end();
		callback(outputStreamBuffer.getContents(), null);
	});
}
