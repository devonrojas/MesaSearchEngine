require("dotenv").config();
const Router = require("express").Router();
const rp = require("request-promise");

const DB = require("../db");
const Throttler = require("../engine/Throttler.js");

const CORTICAL_URI = "http://api.cortical.io:80/rest/";
const RATE_LIMIT = 1;
const RATE_LIMIT_TIME = 15000;

// Admin authentication
// Router.use(AuthController);

Router.get("/", (req, res) => {
    res.sendStatus(200);
})

// PROGRAM ENDPOINTS
Router.get("/programs", (req, res) => {
    DB.Program.find({}, (err, docs) => {
        if(err) {
            return res.status(404).json({
                success: false,
                err: err
            });
        }
        res.status(200).send(docs);
    });
})

Router.get("/program/:code", async(req, res) => {
    let code = req.params.code;
    try {
        DB.Program.findOne({id: code}, (err, program) => {
            if(err) {
                return res.status(400).json({
                    success: false,
                    err: err
                })
            }
            if(!program) {
                return res.status(404).json({
                    success: false,
                    err: "Could not find program"
                })
            }
            res.status(200).send(program);
        })
    } catch(error) {
        console.error(error.message);
        return res.status(500).send(error.message);
    }
})

Router.post("/program/:code", async(req, res) => {
    let code = req.params.code;
    let program = req.body;
    try {
        DB.Program.findOne({id: code}, (err, doc) => {
            if(err) {
                return res.status(404).json({
                    success: false,
                    err: err
                })
            }
            if(doc) {
                return res.status(400).json({
                    success: false,
                    err: "Program already exists in database. If you wish to update this program, use PUT method."
                })
            }
        });
        
        // Fetch keywords for program
        let options = {
            uri: CORTICAL_URI + "terms/similar_terms",
            json: true,
            headers: {
                "api-key": process.env.CORTICAL_API
            },
            qs: {
                retina_name: "en_associative",
                term: program["title"],
                get_fingerprint: true
            }
        }

        let terms = await rp(options);
        terms = terms.map(term => {
            return {
                text: term["term"],
                fingerprint: term["fingerprint"]
            }
        })

        DB.Program.create({
            id: code,
            title: program["title"],
            keywords: terms
        }, (err, program) => {
            if(err) {
                return res.status(400).json({
                    success: false,
                    err: err
                })
            }
            res.status(201).send(program);
        })
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
})

Router.put("/program/:code", async(req, res) => {
    let code = req.params.code;
    let program = req.body;
    try {
        // Fetch keywords for program
        let options = {
            uri: CORTICAL_URI + "terms/similar_terms",
            json: true,
            headers: {
                "api-key": process.env.CORTICAL_API
            },
            qs: {
                retina_name: "en_associative",
                term: program["title"],
                get_fingerprint: true
            }
        }

        let terms = await rp(options);
        terms = terms.map(term => {
            return {
                text: term["term"],
                fingerprint: term["fingerprint"]
            }
        })

        let update = {
            title: program["title"],
            keywords: terms
        }
        DB.Program.findOneAndUpdate({ id: code }, update, {new: true}, (err, program) => {
            if(err) {
                return res.status(404).json({
                    success: false,
                    err: err
                })
            }
            if(!program) {
                return res.status(404).json({
                    success: false,
                    err: "Something went wrong."
                })
            }
            res.status(202).send(program);
        })
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
})

Router.delete("/program/:code", async(req, res) => {
    let code = req.params.code;
    try {
        DB.Program.deleteOne({ id: code }, (err) => {
            if(err) {
                return res.status(400).json({
                    success: false,
                    err: err
                })
            }
            res.sendStatus(204);
        })
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
})

// CAREER ENDPOINTS
Router.get("/careers", (req, res) => {
    DB.Career.find({}, (err, docs) => {
        if(err) {
            return res.status(404).json({
                success: false,
                err: err
            })
        }
        res.status(200).send(docs);
    })
})

Router.get("/career/:code", async(req, res) => {
    let code = req.params.code;
    try {
        DB.Career.findOne({ id: code }, (err, career) => {
            if(err) {
                return res.status(400).json({
                    success: false,
                    err: err
                })
            }
            if(!career) {
                return res.status(404).json({
                    success: false,
                    err: "Could not find career"
                })
            }
            res.status(200).send(career);
        })
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
})

Router.post("/career/:code", async(req, res) => {
    let code = req.params.code;
    let career = req.body;
    try {
        DB.Career.findOne({id: code}, (err, doc) => {
            if(err) {
                res.status(404).json({
                    success: false,
                    err: err
                })
            }
            if(doc) {
                res.status(400).json({
                    success: false,
                    err: "Career already exists in database. If you wish to update this career, use PUT method."
                })
            }
        });

        let payload = career["_title"] + " " + career["description"] + " " + career["_tasks"].join(" ") + " " + career["_technical_skills"].join(" ");
        
        // Fetch keywords for career
        let options = {
            uri: CORTICAL_URI + "text/keywords",
            method: "POST",
            json: true,
            headers: {
                "api-key": process.env.CORTICAL_API
            },
            qs: {
                retina_name: "en_associative",
            },
            body: payload
        }

        let keywords = await rp(options);

        const fn = async(cb, keyword) => {
            let termOptions = options;
        
            termOptions["uri"] = CORTICAL_URI + "terms";
            termOptions["qs"]["get_fingerprint"] = true;
            termOptions["qs"]["term"] = keyword;

            delete termOptions["method"];
            delete termOptions["body"];

            let term = await rp(termOptions);
            let t = {
                text: keyword,
                fingerprint: term[0]["fingerprint"]
            }
            cb(t);
        }
        let terms = await new Throttler(keywords, RATE_LIMIT, RATE_LIMIT_TIME).execute(fn);

        DB.Career.create({
            id: code,
            title: career["_title"],
            keywords: terms
        }, (err, career) => {
            if(err) {
                return res.status(400).json({
                    success: false,
                    err: err
                })
            }
            res.status(201).send(career);
        })
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
})

Router.put("/career/:code", async(req, res) => {
    let code = req.params.code;
    let career = req.body;
    try {
        let payload = career["_title"] + " " + career["description"] + " " + career["_tasks"].join(" ") + " " + career["_technical_skills"].join(" ");

        // Fetch keywords for career
        let options = {
            uri: CORTICAL_URI + "text/keywords",
            method: "POST",
            json: true,
            headers: {
                "api-key": process.env.CORTICAL_API
            },
            qs: {
                retina_name: "en_associative",
            },
            body: payload
        }

        let keywords = await rp(options);

        const fn = async(cb, keyword) => {
            let termOptions = options;
        
            termOptions["uri"] = CORTICAL_URI + "terms";
            termOptions["qs"]["get_fingerprint"] = true;
            termOptions["qs"]["term"] = keyword;

            delete termOptions["method"];
            delete termOptions["body"];

            let term = await rp(termOptions);
            let t = {
                text: keyword,
                fingerprint: term[0]["fingerprint"]
            }
            cb(t);
        }
        let terms = await new Throttler(keywords, RATE_LIMIT, RATE_LIMIT_TIME).execute(fn);

        let update = {
            title: career["title"],
            keywords: terms
        }
        DB.Career.findOneAndUpdate({ id: code }, update, {new: true}, (err, career) => {
            if(err) {
                return res.status(404).json({
                    success: false,
                    err: err
                })
            }
            if(!career) {
                return res.status(404).json({
                    success: false,
                    err: "Something went wrong."
                })
            }
            res.status(202).send(career);
        })
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
})

Router.delete("/career/:code", async(req, res) => {
    let code = req.params.code;
    try {
        DB.Career.deleteOne({ id: code }, (err) => {
            if(err) {
                return res.status(400).json({
                    success: false,
                    err: err
                })
            }
            res.sendStatus(204);
        })
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }  
})

// COURSE ENDPOINTS
Router.get("/courses", (req, res) => {
    DB.Course.find({}, (err, docs) => {
        if(err) {
            return res.status(404).json({
                success: false,
                err: err
            })
        }
        res.status(200).send(docs);
    })
})

Router.get("/course/:code", async(req, res) => {
    let code = req.params.code;
    try {
        DB.Course.findOne({ id: code }, (err, career) => {
            if(err) {
                return res.status(400).json({
                    success: false,
                    err: err
                })
            }
            if(!career) {
                return res.status(404).json({
                    success: false,
                    err: "Could not find career"
                })
            }
            res.status(200).send(career);
        })
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
})

Router.post("/course/:code", async(req, res) => {
    let code = req.params.code;
    let course = req.body;
    try {
        DB.Course.findOne({id: code}, (err, doc) => {
            if(err) {
                res.status(404).json({
                    success: false,
                    err: err
                })
            }
            if(doc) {
                res.status(400).json({
                    success: false,
                    err: "Course already exists in database. If you wish to update this course, use PUT method."
                })
            }
        });

        let payload = course["description"];
        
        // Fetch keywords for career
        let options = {
            uri: CORTICAL_URI + "text/keywords",
            method: "POST",
            json: true,
            headers: {
                "api-key": process.env.CORTICAL_API
            },
            qs: {
                retina_name: "en_associative",
            },
            body: payload
        }

        let keywords = await rp(options);

        const fn = async(cb, keyword) => {
            let termOptions = options;
        
            termOptions["uri"] = CORTICAL_URI + "terms";
            termOptions["qs"]["get_fingerprint"] = true;
            termOptions["qs"]["term"] = keyword;

            delete termOptions["method"];
            delete termOptions["body"];

            let term = await rp(termOptions);
            let t = {
                text: keyword,
                fingerprint: term[0]["fingerprint"]
            }
            cb(t);
        }
        let terms = await new Throttler(keywords, RATE_LIMIT, RATE_LIMIT_TIME).execute(fn);

        DB.Course.create({
            id: code,
            title: course["title"],
            keywords: terms
        }, (err, course) => {
            if(err) {
                return res.status(400).json({
                    success: false,
                    err: err
                })
            }
            res.status(201).send(course);
        })
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
})

Router.put("/course/:code", async(req, res) => {
    let code = req.params.code;
    let course = req.body;
    try {
        let payload = course["description"];

        // Fetch keywords for career
        let options = {
            uri: CORTICAL_URI + "text/keywords",
            method: "POST",
            json: true,
            headers: {
                "api-key": process.env.CORTICAL_API
            },
            qs: {
                retina_name: "en_associative",
            },
            body: payload
        }

        let keywords = await rp(options);

        const fn = async(cb, keyword) => {
            let termOptions = options;
        
            termOptions["uri"] = CORTICAL_URI + "terms";
            termOptions["qs"]["get_fingerprint"] = true;
            termOptions["qs"]["term"] = keyword;

            delete termOptions["method"];
            delete termOptions["body"];

            let term = await rp(termOptions);
            let t = {
                text: keyword,
                fingerprint: term[0]["fingerprint"]
            }
            cb(t);
        }
        let terms = await new Throttler(keywords, RATE_LIMIT, RATE_LIMIT_TIME).execute(fn);

        let update = {
            title: course["title"],
            keywords: terms
        }
        DB.Course.findOneAndUpdate({ id: code }, update, {new: true}, (err, course) => {
            if(err) {
                return res.status(404).json({
                    success: false,
                    err: err
                })
            }
            if(!course) {
                return res.status(404).json({
                    success: false,
                    err: "Something went wrong."
                })
            }
            res.status(202).send(course);
        })
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
})

Router.delete("/course/:code", async(req, res) => {
    let code = req.params.code;
    try {
        DB.Course.deleteOne({ id: code }, (err) => {
            if(err) {
                return res.status(400).json({
                    success: false,
                    err: err
                })
            }
            res.sendStatus(204);
        })
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }  
})

module.exports = Router;