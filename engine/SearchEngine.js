/**
 * @module engine/search
 * @author Devon Rojas
 * 
 * @requires db
 * @requires helpers
 */

// Package imports
require("dotenv").config();
const { promisify } = require("util");
const fs = require("fs");

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Module imports
const DB = require("../db");
const { asyncForEach } = require("../helpers");


/**
 * Handles the search for a particular search category
 */
class SearchEngine {
    /**
     * Creates an empty SearchEngine object.
     * 
     * @param {String} type Either 'Program', 'Course', or 'Career'
     */
    constructor(type) {
        this._type = type;
        this.docs;
        this.length;
        this._cache_file = __basedir + "/cache/" + this._type.toLowerCase() + "s.json";
        this._cached = false;
    }

    /**
     * Loads search engine with all documents of type passed in to constructor.
     * If a cached file exists in /cache, the Search Engine pulls from that to
     * speed up search process.
     */
    async _init() {
        let docs;
        // Determine whether or not to load/create cache file.
        if(!this.cached) {
            docs = await DB[this._type].find({});
            await writeFileAsync(this._cache_file, JSON.stringify(docs));
            this.cached = true;
        } else {
            docs = JSON.parse(await readFileAsync(this._cache_file));
        }

        // Disregard any courses that are not currently active (per SDCCD data)
        this.docs = docs.filter(doc => {
            // Allow for course active/inactive status
            if(doc.hasOwnProperty("active")) {
                return doc["active"];
            } else {
                return true;
            }
        }).map(doc => new Document(doc["id"], doc["title"], doc["keywords"])); // Create new Document for each record in database/cache.
        this.length = docs.length;
    }

    /**
     * Searches documents against term(s) passed in to function and returns relevant matches.
     * 
     * @param  {...String} terms Term(s) to search for in documents.
     * @return {Array} A list of all matching documents.
     */
    async search(...terms) {
        terms = terms
        .map(term => term.toLowerCase())
        .map(term => new Term(term)) // Create new Term objects from each query term
        .map(term => {
            let df = 0;
            this.docs.forEach(doc => {
                if(doc.includes(term["word"])) {
                    df++;
                }
            })
            term["_idf"] = this._idf(df);
            return term;
        })

        /*********************************************
                 FOR USE WITH CORTICAL.IO API 
        **********************************************/
        // await asyncForEach(terms, async(term) => {
        //     await term._getFingerprint()
        //     await new Promise((resolve, reject) => {
        //         setTimeout(() => {
        //             resolve();
        //         }, TIMEOUT)
        //     })
        // })

        await asyncForEach(this.docs, async(doc) => {
            doc.setTerms(terms)
            await doc.calculateWeights();
            await doc.calculateScore();
            doc["query"] = doc["query"].map(term => {
                return {
                    word: term["word"],
                    score: term["score"],
                    cosine: term["_wd"]
                }
            });
        })

        return this.docs.map(doc => {
            return {
                id: doc["id"],
                title: doc["title"],
                score: doc["score"],
                query: doc["query"]
            }
        })
        .filter(doc => doc["score"] > 0)
        .sort((a, b) => {
            let scoreA = a["score"];
            let scoreB = b["score"]

            if(scoreA > scoreB) {
                return -1;
            } else if(scoreB > scoreA) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    /**
     * Calculates the inverse document frequency of a collection
     * 
     * @param {number} df The document frequency of a collection
     * @return {number} The inverse document frequencey of a collection
     */
    _idf(df) {
        if(df <= 0) return 0;
        return Math.log(this.length / df);
    }
}

/**
 * Handles the logic for a specific document in a collection
 */
class Document {
    /**
     * Initializes the document.
     * 
     * @param {string} id       Document identifier.
     * @param {string} title    Title of document.
     * @param {string} keywords Keywords within document.
     */
    constructor(id, title, keywords) {
        this.id = id;
        this.title = title;
        this.keywords = keywords.map(keyword => keyword.toLowerCase());
        this.query = [];
        this.score = 0;
    }

    /**
     * Checks whether a search term exists in the document's keywords.
     * 
     * @param {string} term 
     * @return {boolean} Whether the term exists in the document's keywords.
     */
    includes(term) {
        return this.keywords.some(keyword => keyword.includes(term));
    }

    /**
     * Sets a document's query terms, and calculates the frequencies of each term.
     * 
     * @param {string[]} terms A list of terms to search document against.
     */
    setTerms(terms) {
        this.query = terms;
        this.tf();
        this.wf();
    }

    /**
     * Calculates the total score of a document based on query terms.
     * 
     * @example
     * // Formula: Score = SUM[term idf (inverse document frequency) * term wd (term weight)]
     * 
     * @see {@link https://en.wikipedia.org/wiki/Vector_space_model|Vector Space Model Formula}
     */
    async calculateScore() {
        this.query.forEach(term => {
            term["score"] = term["_idf"] * term["_wd"];
            this.score += term["score"];
            if(this.title.toLowerCase().includes(term["word"])) {
                this.score++;
            } else if(typeof this.id === "string" && isNaN(this.id.charAt(0))) {
                let digit = this.id.search(/\d/);
                let str = this.id.slice(0, digit);
                if(str.toLowerCase().includes(term["word"])) {
                    this.score+=2;
                }
            }
        })
        // await asyncForEach(this.query, async(term) => {
        //     await asyncForEach(this.keywords, async(keyword, index) => {
        //         let score = await this.compareFingerprints(term["_fingerprint"]["positions"], keyword["fingerprint"][0]["positions"]);
        //         term["score"] += score;
        //         this.score += score;
        //     })
        //     term["score"] /= this.keywords.length;
        // })
    }

    /**
     * Calculates the weights of each term in the query based off of the document term frequency.
     */
    async calculateWeights() {
        let termSum = this.query.reduce((acc, term) => {
            acc += term["_wf"];
            return acc;
        }, 0)
        this.query.forEach(term => {
            term["_wd"] = term["_tf"] === 0 || termSum === 0 ? 0 : term["_tf"] / Math.sqrt(termSum);
        })
    }

    /**
     * Calculates the term frequency in the document of each query term.
     */
    tf() {
        this.query.forEach(term => {
            term["_tf"] = this.keywords.reduce((acc, item) => {
                if(item.includes(term["word"])) {
                    acc++;
                }
                return acc;
            }, 0)
        })
    }

    /**
     * Calculates the frequency weight of each query term.
     */
    wf() {
        this.query.forEach(term => {
            term["_wf"] = term["_tf"] * term["_tf"];
        })
    }

    /**
     * @deprecated
     * Uses cortical.io's API to compare keyword fingerprints against each
     * other for better relevancy checking. However, their request limit is 
     * currently too slow to allow for an efficient execution of this process.
     */
    async compareFingerprints(fingerprint1, fingerprint2) {
        // // console.log(fingerprint1.length, fingerprint2.length);
        // // if(fingerprint1.length !== fingerprint2.length) {
        // //     throw new Error("Fingerprint lengths do not match.");
        // // }

        // let length = fingerprint1.length > fingerprint2.length ? fingerprint1.length : fingerprint2.length;

        // // let expression = {
        // //     and: [
        // //         fingerprint1, fingerprint2
        // //     ]
        // // }

        // // let options = {
        // //     uri: CORTICAL_URI + "/expressions",
        // //     qs: {
        // //         retina_name: "en_associative"
        // //     },
        // //     body: expression
        // // }
        // // let fingerprint_compare = await rp(options);
        // let fingerprint_compare = fingerprint1.filter(val => fingerprint2.includes(val)).length;
        // return fingerprint_compare / length;
    }
}

/**
 * Handles the properties of a query term.
 */
class Term {
    /**
     * Initializes the Term.
     * @param {string} str The query term.
     */
    constructor(str) {
        this.word = str;
        this.score = 0;
        this._df = 0;
        this._tf = 0;
        this._idf = 0;
        this._wf = 0;
        this._wd = 0;
        // this._fingerprint = {};
    }

    /**
     * @deprecated
     * Uses cortical.io's API to retrieve the fingerprint of a query term.
     * However, their request limit is currently too slow to allow for an
     * efficient execution of this process.
     */
    async _getFingerprint() {
        // let options = {
        //     uri: CORTICAL_URI + "terms",
        //     json: true,
        //     headers: {
        //         "api-key": process.env.CORTICAL_API
        //     },
        //     qs: {
        //         retina_name: "en_associative",
        //         term: this.word,
        //         get_fingerprint: true
        //     }
        // }
        // let res = await rp(options);
        // this._fingerprint = res[0]["fingerprint"];
    }
}

module.exports = SearchEngine;