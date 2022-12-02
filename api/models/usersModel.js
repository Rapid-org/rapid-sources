const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    uid: {
        type: String,
        required: 'Please enter the UID for the user.'
    },
    name: {
        type: String,
        required: 'Please enter the name for the user.'
    },
    email: {
        type: String,
        default: "",
        required: 'Please enter the email for the user.'
    },
    autoload: {
        type: Boolean,
        default: false,
        required: false
    },
    language: {
        type: String,
        required: false,
        default: "en"
    },
    darkTheme: {
        type: Boolean,
        required: false,
        default: false
    },
    themeColor: {
        type: String,
        required: false,
        default: "#6200ee"
    },
    gridView: {
      type: Boolean,
      default: true,
      required: false
    },
    suppressWarnings: {
      type: Boolean,
      default: false,
      required: false
    }
});

module.exports = mongoose.model('users', usersSchema);
