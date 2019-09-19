const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CareerSchema = new Schema({
    id: String,
    title: String,
    keywords: [String]
})

module.exports = mongoose.model("Career", CareerSchema);