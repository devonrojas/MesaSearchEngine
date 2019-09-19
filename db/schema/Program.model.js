const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProgramSchema = new Schema({
    id: Number,
    title: String,
    keywords: [String]
})

module.exports = mongoose.model("Program", ProgramSchema);