const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    id: String,
    title: String,
    keywords: [String],
    active: Boolean
})

module.exports = mongoose.model("Course", CourseSchema);