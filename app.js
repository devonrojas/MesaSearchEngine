require("dotenv").config();
const PORT = process.env.PORT || 9000;

const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const rp = require("request-promise");
const fs = require("fs");

const SearchEngine = require("./engine/SearchEngine.js");

const WATSON_URL = "https://gateway.watsonplatform.net/natural-language-understanding/api/v1/analyze?version=2019-07-12";
const WATSON_HEADERS = {
    Authorization: 'Basic ' + Buffer.from(process.env.WATSON_API_KEY).toString('base64'),
    "Content-Type": "application/json"
}
let WATSON_OPTIONS = {
    uri: WATSON_URL,
    method: 'POST',
    headers: WATSON_HEADERS,
    json: true
}

setInterval(() => {
    http.get("http://polar-wave-14549.herokuapp.com/");
}, 300000);

app.use(cors());

const SEARCH_DATA = require("./search.json");
const COURSE_DATA = require("./courses.json");

app.get("/", (req, res) => {
    res.sendStatus(200);
})

app.get("/search", (req, res) => {
    let docs = COURSE_DATA.map(course => {
        return {
            id: course["course_id"],
            text: course["description"]
        }
    });
    let terms = ["accounting"]
    let search = new SearchEngine(docs);

    let result = search.search(...terms);

    res.status(200).send(result.slice(0, 50));
})

app.get("/programsearch", (req, res) => {
    let query = req.query;
    let searchTerms = query.q;
    let searchLimit = query.limit;
    if(searchTerms) {
        searchTerms = searchTerms.toLowerCase();
    }

    if(searchTerms) {
        let docs = SEARCH_DATA["programs"].map(program => {
            return {
                id: program["name"],
                text: program_keywords(program)
            }
        });
        let engine = new SearchEngine(docs);
        let results = engine.search(...searchTerms.split(" "));
        results = results.sort((a, b) => {
            let scoreA = a.score;
            let scoreB = b.score;

            if(scoreA < scoreB) {
                return 1;
            } else if(scoreB < scoreA) {
                return -1;
            } else return 0;
        })
        if(searchLimit) {
            results = results.slice(0, searchLimit);
        }
        res.status(200).send(results);
    } else {
        res.status(200).send(SEARCH_DATA);
    }
})

app.get("/careersearch", (req, res) => {
    res.status(200).send(["hello"]);
})

app.get("/coursesearch", (req, res) => {
    let query = req.query;
    let searchTerms = query.q;
    let searchLimit = query.limit;
    if(searchTerms) {
        searchTerms = searchTerms.toLowerCase();
    }
    if(searchTerms) {
        let docs = COURSE_DATA.map(course => {
            return {
                id: course["course_id"],
                text: course["description"]
            }
        });
        let engine = new SearchEngine(docs);
        let results = engine.search(...searchTerms.split(" "));
        results = results.sort((a, b) => {
            let scoreA = a.score;
            let scoreB = b.score;

            if(scoreA < scoreB) {
                return 1;
            } else if(scoreB < scoreA) {
                return -1;
            } else return 0;
        })
        if(searchLimit) {
            results = results.slice(0, searchLimit);
        }
        res.status(200).send(results);
    } else {
        res.status(200).send(COURSE_DATA.map(course => course.course_id));
    }
})

app.get("/ibm", async(req, res) => {
    try {
        let course_descriptions = COURSE_DATA.map(course => course["description"]);
        WATSON_OPTIONS["body"] = {
            text:  "",
            features: {
                keywords: {
                    limit: 20
                }
            }
        };
        let text_units = 0;
        let text_characters = 0;
        await asyncForEach(course_descriptions, async(course, index) => {
            // Append course description to request payload
            WATSON_OPTIONS["body"]["text"] = course;
            
            let data = await rp(WATSON_OPTIONS);
            // Monitor total text units processed
            text_units += data["usage"]["text_units"];
            text_characters += data["usage"]["text_characters"];

            // Filter out keyword data and map keyword text
            let keywords = data["keywords"]
            .filter(keyword => keyword["relevance"] > 0.6)
            .map(keyword => keyword["text"]);
            console.log(COURSE_DATA[index]["course_id"] + " | " + keywords)
            
            // Append results to JSON file
            COURSE_DATA[index]["keywords"] = keywords;
        });
        let msg = "Total text units processed: " + text_units + ". Total text characters procesed: " + text_characters + ".";
        res.status(200).send(msg);
        console.log(msg);
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

const asyncForEach = async(arr, cb) => {
    for(let i = 0; i < arr.length; i++) {
        await cb(arr[i], i, arr);
    }
}