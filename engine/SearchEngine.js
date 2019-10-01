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
     * Loads search engine with all documents of type passed in to constructor
     */
    async _init() {
        let docs;
        if(!this.cached) {
            docs = await DB[this._type].find({});
            await writeFileAsync(this._cache_file, JSON.stringify(docs));
            this.cached = true;
        } else {
            docs = JSON.parse(await readFileAsync(this._cache_file));
        }
        this.docs = docs.filter(doc => {
            // Allow for course active/inactive status
            if(doc.hasOwnProperty("active")) {
                return doc["active"];
            } else {
                return true;
            }
        }).map(doc => new Document(doc["id"], doc["title"], doc["keywords"]));
        this.length = docs.length;
    }

    /**
     * Searches documents against term(s) passed in to function and returns relevant matches.
     * 
     * @param  {...String} terms
     */
    async search(...terms) {
        terms = terms
        .map(term => term.toLowerCase())
        .map(term => new Term(term))
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

    _idf(df) {
        if(df <= 0) return 0;
        return Math.log(this.length / df);
    }
}

class Document {
    constructor(id, title, keywords) {
        this.id = id;
        this.title = title;
        this.keywords = keywords.map(keyword => keyword.toLowerCase());
        this.query = [];
        this.score = 0;
    }

    includes(term) {
        return this.keywords.some(keyword => keyword.includes(term));
    }

    setTerms(terms) {
        this.query = terms;
        this.tf();
        this.wf();
    }

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

    async calculateWeights() {
        let termSum = this.query.reduce((acc, term) => {
            acc += term["_wf"];
            return acc;
        }, 0)
        this.query.forEach(term => {
            term["_wd"] = term["_tf"] === 0 || termSum === 0 ? 0 : term["_tf"] / Math.sqrt(termSum);
        })
    }

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

    wf() {
        this.query.forEach(term => {
            term["_wf"] = term["_tf"] * term["_tf"];
        })
    }

    // async compareFingerprints(fingerprint1, fingerprint2) {
    //     // console.log(fingerprint1.length, fingerprint2.length);
    //     // if(fingerprint1.length !== fingerprint2.length) {
    //     //     throw new Error("Fingerprint lengths do not match.");
    //     // }

    //     let length = fingerprint1.length > fingerprint2.length ? fingerprint1.length : fingerprint2.length;

    //     // let expression = {
    //     //     and: [
    //     //         fingerprint1, fingerprint2
    //     //     ]
    //     // }

    //     // let options = {
    //     //     uri: CORTICAL_URI + "/expressions",
    //     //     qs: {
    //     //         retina_name: "en_associative"
    //     //     },
    //     //     body: expression
    //     // }
    //     // let fingerprint_compare = await rp(options);
    //     let fingerprint_compare = fingerprint1.filter(val => fingerprint2.includes(val)).length;
    //     return fingerprint_compare / length;
    // }
}

class Term {
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

    // async _getFingerprint() {
    //     let options = {
    //         uri: CORTICAL_URI + "terms",
    //         json: true,
    //         headers: {
    //             "api-key": process.env.CORTICAL_API
    //         },
    //         qs: {
    //             retina_name: "en_associative",
    //             term: this.word,
    //             get_fingerprint: true
    //         }
    //     }
    //     let res = await rp(options);
    //     this._fingerprint = res[0]["fingerprint"];
    // }
}

module.exports = SearchEngine;