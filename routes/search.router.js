/**
 * @module routes/search
 * @author Devon Rojas
 * 
 * @requires {@link https://www.npmjs.com/package/express| express}
 * @requires engine/search
 */

 // Package imports
const express = require("express");

// Module imports
const SearchEngine = require("../engine/SearchEngine");

// Create preliminary Search Engine objects
const ProgramEngine = new SearchEngine("Program");
const CareerEngine = new SearchEngine("Career");
const CourseEngine = new SearchEngine("Course");

/**
 * @type {object}
 * @const
 * @namespace searchRouter
 */
const Router = express.Router();

/**
 * @name GET/
 * @function
 * @memberof module:routes/search~searchRouter
 */
Router.get("/", (req, res) => {
    res.sendStatus(200);
})

/**
 * Searches programs with query string.
 * 
 * @name GET/programs
 * @function
 * @memberof module:routes/search~searchRouter
 */
Router.get("/programs", async (req, res) => {
    await ProgramEngine._init()

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

/**
 * Searches courses with query string.
 * 
 * @name GET/courses
 * @function
 * @memberof module:routes/search~searchRouter
 */
Router.get("/courses", async(req, res) => {
    await CourseEngine._init()

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

    let results = await CourseEngine.search(...terms)
    if(searchLimit) {
        results = results.slice(0, searchLimit);
    }
    res.status(200).send(results);
})

/**
 * Searches careers with query string.
 * 
 * @name GET/careers
 * @function
 * @memberof module:routes/search~searchRouter
 */
Router.get("/careers", async(req, res) => {
    await CareerEngine._init()

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
    res.status(200).send(results);
})

module.exports = Router;