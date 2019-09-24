/**
 * @module MesaSearchEngine
 * @author Devon Rojas
 * 
 * @requires {@link https://www.npmjs.com/package/express| express}
 * @requires {@link https://www.npmjs.com/package/cors| cors}
 * @requires {@link https://www.npmjs.com/package/body-parser| body-parser}
 * @requires {@link https://nodejs.org/api/http.html| http}
 * @requires {@link https://mongoosejs.com/docs/guide.html| mongoose}
 * 
 * @requires routes
 */
require("dotenv").config();
const PORT = process.env.PORT || 9000;

// Package imports
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const mongoose = require("mongoose");

// Express routers
const { AdminRouter, SearchRouter } = require("./routes");

// Keep server alive
setInterval(() => {
    http.get("http://polar-wave-14549.herokuapp.com/");
}, 300000);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("Connected to database..."))
.catch(err => console.error("Could not connect to database..."));

/**
 * express module
 * @type {object}
 * @const
 * @namespace app
 */
const app = express();

// Request middleware
app.use(cors({
    allowedHeaders: ["Content-Type"],
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
    origin: "*"
}));
app.use(bodyParser.json());

// Routing middleware
/**
 * Defines available /admin routes
 * @memberof module:MesaSearchEngine~app
 */
app.use("/admin", AdminRouter);
/**
 * Defines available /search routes
 * @memberof module:MesaSearchEngine~app
 */
app.use("/search", SearchRouter);

/**
 * @name GET/
 * @function
 * @memberof module:MesaSearchEngine~app
 */
app.get("/", (req, res) => {
    const html = "<b>List of available routes:</b><p>/admin<br>/search</p>"
    res.status(200).send(html);
})

// Instantiates Express application on specified PORT
app.listen(PORT, () => console.log(`App running on port: ${PORT}.`));