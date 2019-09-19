const Router = require("express").Router();
const SearchEngine = require("../engine/SearchEngine");

Router.get("/", (req, res) => {
    res.sendStatus(200);
})

Router.get("/programs", async (req, res) => {
    let query = req.query;
    let searchTerms = query.q;
    let searchLimit = query.limit;
    if(searchTerms) {
        searchTerms = searchTerms.toLowerCase();
    }

    if(searchTerms) {
        let engine = new SearchEngine("Program");
        await engine._init();
        let results = await engine.search(...searchTerms.split(" "));
        // let results = engine.search(...searchTerms.split(" "));
        // results = results.sort((a, b) => {
        //     let scoreA = a.score;
        //     let scoreB = b.score;

        //     if(scoreA < scoreB) {
        //         return 1;
        //     } else if(scoreB < scoreA) {
        //         return -1;
        //     } else return 0;
        // })
        // if(searchLimit) {
        //     results = results.slice(0, searchLimit);
        // }
        res.status(200).send(results);
    } else {
        res.status(200).send(SEARCH_DATA);
    }
})

Router.get("/courses", (req, res) => {
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

Router.get("/careers", (req, res) => {
    res.sendStatus(200);
})

module.exports = Router;