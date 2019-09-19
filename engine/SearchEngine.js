require("dotenv").config();
const DB = require("../db");
// const rp = require("request-promise");

const { asyncForEach } = require("../helpers");

class SearchEngine {
    constructor(type) {
        this._type = type;
        this.docs;
        this.length;
    }

    async _init() {
        let docs = await DB[this._type].find({});
        this.docs = docs.map(doc => new Document(doc["title"], doc["keywords"]));
        this.length = docs.length;
    }

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
            // console.log("Doc freq: " + df);
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
                score: doc["score"],
                query: doc["query"]
            }
        })
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
    constructor(id, keywords) {
        this.id = id;
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
            if(this.id.toLowerCase().includes(term["word"])) {
                this.score++;
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
            // console.log(term["word"] + " idf: " + term["_idf"] + " tf: " + term["_tf"] + " wd: " + term["_wd"] + " wf: " + term["_wf"], termSum);
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
            // console.log(this.id + " | " + term["word"] + " idf: " + term["_idf"] + " tf: " + term["_tf"] + " = " + (term["_idf"] * term["_tf"]));
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