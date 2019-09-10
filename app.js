const PORT = process.env.PORT || 9000;

const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

const SEARCH_DATA = require("./search.json");

app.get("/", (req, res) => {
    res.sendStatus(200);
})

app.get("/search", (req, res) => {
    let query = req.query;
    let searchTerm = query.q;
    if(searchTerm) {
        searchTerm = searchTerm.toLowerCase().replace(/\ /g, "");
    }

    if(searchTerm) {
        let filteredData = {};
        filteredData["programs"] = SEARCH_DATA["programs"]
        .map(program => keywords(program))
        .filter(program => program["search"].includes(searchTerm));
        res.status(200).send(filteredData);
    } else {
        res.status(200).send(SEARCH_DATA);
    }
})

app.listen(PORT, () => console.log(`App running on port: ${PORT}.`));

const keywords = (program) => {
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
    str = [...new Set(str)].join("");

    program["search"] = str.toLowerCase();
    return program;
}