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
const ONE_SECOND = 1000;
const ONE_MINUTE = ONE_SECOND * 60;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;

global.__basedir = __dirname;

// Package imports
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const mongoose = require("mongoose");
const rp = require("request-promise");

// Express routers
const { AdminRouter, SearchRouter } = require("./routes");

// Keep server alive & refresh cached data
var other_program_data = require("./programs.json")["programs"];
var PROGRAMS, COURSES;
setInterval(() => {
    http.get("http://polar-wave-14549.herokuapp.com/");
    rp(process.env.SDMESA_ONET_URI + "/program?detail=true", {json: true})
    .then(res => {
        console.log(res["programs"][0])
        PROGRAMS = res["programs"];
        PROGRAMS.map(program => {
            console.log(program);
            let p = other_program_data.find(p => p["code"] === program["code"]);
            program["description"] = p["description"];
            return program;
        })
    })
    .catch(err => console.error(err));
    rp(process.env.SDMESA_COURSES_URI, {json: true})
    .then(res => COURSES = res);
}, ONE_MINUTE * 30);

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
    allowedHeaders: ["Content-Type", "Mesa-API"],
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

app.get("/course/:id", (req, res) => {
    let i = Object.keys(COURSES).indexOf(req.params.id);
    if(i !== -1) {
        res.status(200).send(COURSES[req.params.id]);
    } else {
        res.status(404).send("Course not found.");
    }
})

app.get("/program/:id", (req, res) => {
    let i = PROGRAMS.map(program => program["code"]).indexOf(+req.params.id);
    if(i !== -1) {
        res.status(200).send(PROGRAMS[i]);
    } else {
        res.status(404).send("Program not found.");
    }
})

// Instantiates Express application on specified PORT
app.listen(PORT, () => console.log(`App running on port: ${PORT}.`));