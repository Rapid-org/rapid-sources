const config = {};

config.web = {};

config.mongodb = {};

config.web.port = process.env.WEB_PORT || 9980;

config.web.fileStorageLocation = 'C:/storage';

config.mongodb.url = "mongodb://localhost/Rapid";

module.exports = config;