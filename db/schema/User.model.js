const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: String,
    api: String
})

module.exports = mongoose.model("User", UserSchema);