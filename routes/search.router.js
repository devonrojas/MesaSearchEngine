const Router = require("express").Router();
const SearchEngine = require("../engine/SearchEngine");

const ProgramEngine =  new SearchEngine("Program");
const CareerEngine =  new SearchEngine("Career");
const CourseEngine =  new SearchEngine("Course");


Router.get("/", (req, res) => {
    res.sendStatus(200);
})

Router.get("/programs", async (req, res) => {
    ProgramEngine._init()

    let query = req.query;
    let searchTerms = query.q;
    let searchLimit = query.limit;
    if(searchTerms) {
        searchTerms = searchTerms.toLowerCase();
    }

    let terms = [];
    if(searchTerms) {
        terms = searchTerms.trim().split(" ");
        if(terms.length > 1) {
            terms.push(searchTerms);
        }
    }

    let results = await ProgramEngine.search(...terms)
    if(searchLimit) {
        results = results.slice(0, searchLimit);
    }
    res.status(200).send(results);
})

Router.get("/courses", async(req, res) => {
    CourseEngine._init()

    let query = req.query;
    let searchTerms = query.q;
    let searchLimit = query.limit;
    if(searchTerms) {
        searchTerms = searchTerms.toLowerCase();
    }

    let terms = [];
    if(searchTerms) {
        terms = searchTerms.trim().split(" ");
        if(terms.length > 1) {
            terms.push(searchTerms);
        }
    }

    let results = await Course.search(...terms)
    if(searchLimit) {
        results = results.slice(0, searchLimit);
    }
    res.status(200).send(results);
})

Router.get("/careers", async(req, res) => {
    CareerEngine._init()

    let query = req.query;
    let searchTerms = query.q;
    let searchLimit = query.limit;
    if(searchTerms) {
        searchTerms = searchTerms.toLowerCase();
    }

    let terms = [];
    if(searchTerms) {
        terms = searchTerms.trim().split(" ");
        if(terms.length > 1) {
            terms.push(searchTerms);
        }
    }

    let results = await CareerEngine.search(...terms)
    if(searchLimit) {
        results = results.slice(0, searchLimit);
    }
    res.status(200).send(results);})

module.exports = Router;