const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    id: String,
    title: String,
    keywords: [{ text: String, fingerprint: [{ positions: [Number] }] }]
})

module.exports = mongoose.model("Course", CourseSchema);