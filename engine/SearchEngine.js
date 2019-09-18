const DB = require("./DatabaseService.js");

class SearchEngine {
    constructor(data) {
        this.docs = data.map(item => new Document(...Object.values(item)));
        this.length = this.docs.length;
    }

    search(...terms) {
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

        this.docs.forEach(doc => {
            doc.setTerms(terms)
            doc.calculateWeights();
            doc.calculateScore();
            doc["terms"] = doc["terms"].map(term => {
                return {
                    word: term["word"],
                    score: term["score"]
                }
            });
        });

        return this.docs.map(doc => {
            return {
                id: doc["id"],
                score: doc["score"],
                terms: doc["terms"]
            }
        });
    }

    _idf(df) {
        if(df <= 0) return 0;
        return Math.log(this.length / df);
    }
}

class Document {
    constructor(id, data) {
        this.id = id;
        this.doc = Array.isArray(data) ? data : data.toLowerCase().split(" ");
        this.terms = [];
        this.score = 0;
    }

    includes(term) {
        return this.doc.indexOf(term) > -1;
    }

    setTerms(terms) {
        this.terms = terms;
        this.tf();
        this.wf();
    }

    calculateScore() {
        this.terms.forEach(term => {
            term["score"] = term["_idf"] * term["_wd"];
        })
        this.score = this.terms.reduce((acc, term) => {
            acc += term["score"];
            return acc;
        }, 0);
    }

    calculateWeights() {
        let termSum = this.terms.reduce((acc, term) => {
            acc += term["_wf"];
            return acc;
        }, 0)
        this.terms.forEach(term => {
            term["_wd"] = term["_tf"] === 0 || termSum === 0 ? 0 : term["_tf"] / Math.sqrt(termSum);
        })
    }

    tf() {
        this.terms.forEach(term => {
            term["_tf"] = this.doc.reduce((acc, doc) => {
                if(doc.includes(term["word"])) {
                    acc++;
                }
                return acc;
            }, 0)
        })
    }

    wf() {
        this.terms.forEach(term => {
            term["_wf"] = term["_tf"] * term["_tf"];
        })
    }
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
    }
}

module.exports = SearchEngine;