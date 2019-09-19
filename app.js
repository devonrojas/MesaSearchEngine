require("dotenv").config();
const PORT = process.env.PORT || 9000;

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const rp = require("request-promise");
const fs = require("fs");
const mongoose = require("mongoose");

const { AdminRouter, SearchRouter } = require("./routes");

const Throttler = require("./engine/Throttler.js");

const RATE_LIMIT = 1;
const RATE_LIMIT_TIME = 15000;

const CORTICAL_API = process.env.CORTICAL_API;

setInterval(() => {
    http.get("http://polar-wave-14549.herokuapp.com/");
}, 300000);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("Connected to database..."))
.catch(err => console.error("Could not connect to database..."));

app.use(cors({
    allowedHeaders: ["Content-Type"],
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD"
}));
app.use(bodyParser.json());
app.use("/admin", AdminRouter);
app.use("/search", SearchRouter);

app.get("/", (req, res) => {
    res.sendStatus(200);
})

app.get("/cortical", async(req, res) => {
    try {
        res.status(200).send("Request received. Check logs for progress.");
        let course_descriptions = COURSE_DATA.map(course => course["description"]);

        const fn = async(cb, courses, index) => {
            let options = {
                uri: "http://api.cortical.io:80/rest/text/keywords",
                method: "POST",
                json: true,
                headers: {
                    "api-key": CORTICAL_API
                },
                qs: {
                    retina_name: "en_associative",
                },
                body: courses
            }

            let keywords = await rp(options);
            COURSE_DATA[index]["keywords"] = keywords;
            cb();
        }

        let operations = await new Throttler(course_descriptions, RATE_LIMIT, RATE_LIMIT_TIME).execute(fn);

        fs.writeFile("courses.json", JSON.stringify(COURSE_DATA), (err) => {if(err) console.error(err.message)});
        console.log("File written.");
    } catch(error) {
        console.error(error);
        res.status(500).send(error.message);
    }
})

app.get("/cortical/fingerprints", async(req, res) => {
    try {
        let payload = COURSE_DATA.map(course => {
            return {
                text: course["description"]
            }
        });

        let options = {
            uri: "http://api.cortical.io:80/rest/text/bulk",
            method: "POST",
            json: true,
            headers: {
                "api-key": CORTICAL_API
            },
            qs: {
                retina_name: "en_associative",
                sparsity: 1.0
            },
            body: payload
        }

        let fingerprints = await rp(options);
        fingerprints.forEach((fingerprint, index) => {
            COURSE_DATA[index]["fingerprint"] = fingerprint;
        })

        res.status(200).send("Fingerprints generated.");
        fs.writeFile("courses.json", JSON.stringify(COURSE_DATA), (err) => {if(err) console.error(err.message)});
        console.log("File written.");       
    } catch(error) {
        console.error(error);
        res.status(500).send(error.message);
    }
})

app.listen(PORT, () => console.log(`App running on port: ${PORT}.`));

const program_keywords = (program) => {
    let str = [];
    program["degree_types"].forEach(type => {
        let s = type.split(" ");
        str.push(...s);
    })
    program["degrees"].forEach(degree => {
        let s = degree.replace(":", "").replace("-", "").split(" ");
        str.push(...s);
    })
    program["keywords"].forEach(keyword => {
        let s = keyword.split(" ");
        str.push(...s);
    })
    str = [...new Set(str)];

    return str;
}
const course_keywords = (course) => {
    let str = [];

    str.push(...course["course_id"].split(" "));
    str.push(...course["title"].split(" "));

    course["keywords"].forEach(keyword => {
        let s = keyword.split(" ");
        str.push(...s);
    })
    str = [...new Set(str)].join("");

    course["search"] = str.toLowerCase();
    return course;
}