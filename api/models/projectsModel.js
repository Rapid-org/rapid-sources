const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('./../config');
const { ObjectID } = require('mongoose/lib/schema');

const projectsSchema = new Schema({
    userId: {
        type: String,
        required: 'Please enter the userID for the project.'
    },
    name: {
        type: String,
        required: 'Please enter the name for the project.'
    },
    description: {
        type: String,
        default: "",
        required: false
    },
    packageName: {
      type: String,
      required: 'Please enter the package name for the project.'   
    }
}, {
    timestamps: true
});

function isPackageName(packageName) {
    return (/(^(?:[a-z_]+(?:\d*[a-zA-Z_]*)*)(?:\.[a-z_]+(?:\d*[a-zA-Z_]*)*)*$)/).test(packageName);
}


function isClassNameValid(className) {
    return (!(/^\d/).test(className) && (/^[A-Z][A-Za-z]*$/).test(className));
}

function isValidUrl(url) {
    return url.length === 0 || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
}

module.exports = mongoose.model('projects', projectsSchema);