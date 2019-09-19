const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProgramSchema = new Schema({
    id: Number,
    title: String,
    keywords: [{ text: String, fingerprint: [{ positions: [Number] }] }]
})

module.exports = mongoose.model("Program", ProgramSchema);