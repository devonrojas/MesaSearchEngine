/**
 * @module routes/admin
 * @author Devon Rojas
 * 
 * @requires {@link https://www.npmjs.com/package/express| express}
 * @requires {@link https://www.npmjs.com/package/request-promise| request-promise}
 * 
 * @requires db
 * @requires engine/throttler
 */

require("dotenv").config();
// Package imports
const express = require("express")
const rp = require("request-promise");

// Module imports
const { wiki_query, watson_nlp, cortical } = require("../helpers");
const DB = require("../db");
const Throttler = require("../engine/Throttler.js");
const RATE_LIMIT = 1;
const RATE_LIMIT_TIME = 1000; // ms

// Static data files
const programs = require("../search.json")["programs"];
const courses = require("../courses.json");

/**
 * @type {object}
 * @const
 * @namespace adminRouter
 */
const Router = express.Router();

// Admin authentication
// Router.use(AuthController);


/*==============================================
              GENERATOR ENDPOINTS
 ==============================================*/

/**
 * Generates new career data from ONET database.
 * 
 * @name GET/generatecareers
 * @function
 * @memberof module:routes/admin~adminRouter
 */
Router.get("/generatecareers", async(req, res) => {

    let options = {
        uri: "https://infinite-spire-51367.herokuapp.com/career",
        method: "GET",
        json: true
    }
    let careers = (await rp(options))["careers"];
    
    try {
        res.sendStatus(202);

        const fn = async(cb, career) => {
            DB.Career.findOne({id: career["code"]}, async(err, doc) => {
                if(err) {
                    console.error(err);
                }
                if(doc) {
                    console.error(doc["title"] + " program already exists.");
                } else {
                    options["uri"] = "https://infinite-spire-51367.herokuapp.com/career/" + career["code"] + "/US/25";
                    career = await rp(options);
                    await new Promise((resolve, reject) => setTimeout(() => resolve(), 3000));

                    let query = career["_title"] + " " + career["_description"][0].toLowerCase() + career["_description"].slice(1) + " " + career["_tasks"].join(" ") + " " + career["_technical_skills"].join(" ");
                    let keywords = await watson_nlp(query);
                    let terms = await cortical(career["_title"]);
            
                    keywords = keywords.concat(terms);
            
                    await DB.Career.create({
                        id: career["_code"],
                        title: career["_title"],
                        keywords: keywords
                    })
                    console.log(career["_title"] + " career created.");
                }
                cb();
            });
        }

        await new Throttler(careers, RATE_LIMIT, RATE_LIMIT_TIME).execute(fn);
    } catch(error) {
        console.error(error);
    }
})

/**
 * Generates new program data from static file.
 * 
 * @name GET/generateprograms
 * @function
 * @memberof module:routes/admin~adminRouter
 */
Router.get("/generateprograms", async(req, res) => {
    try {
        res.sendStatus(202);

        let p = programs.map(program => {
            return {
                name: program["name"],
                code: program["code"]
            }
        });
    
        const fn = async(cb, program) => {
            DB.Program.findOne({id: program["code"]}, async(err, doc) => {
                if(err) {
                    console.error(err);
                }
                if(doc) {
                    console.error(doc["title"] + " program already exists.");
                } else {
                    await new Promise((resolve, reject) => setTimeout(() => resolve(), 3000));
                    let query = [...new Set(program["name"].replace(/('s|-|,)/g,"").replace(/\s{2,}/g," ").replace("/", " ").split(" "))].join(" ");
                    let search = await wiki_query(query);
                    let keywords = await watson_nlp(search);
                    let terms = await cortical(query);
            
                    keywords = keywords.concat(terms);
            
                    await DB.Program.create({
                        id: program["code"],
                        title: program["name"],
                        keywords: keywords
                    })
                    console.log(program["name"] + " program created.");
                }
                cb();
            })
        }
        await new Throttler(p, RATE_LIMIT, RATE_LIMIT_TIME).execute(fn)
    } catch(error) {
        console.error(error.message);
    }
})

/**
 * Generates new course data from static file.
 * @name GET/generatecourses
 * @function
 * @memberof module:routes/admin~adminRouter
 */
Router.get("/generatecourses", async(req, res) => {
    try {
        res.sendStatus(202);
    
        const fn = async(cb, course) => {
            DB.Course.findOne({id: course["course_id"]}, async(err, doc) => {
                if(err) {
                    console.error(err);
                }
                if(doc) {
                    console.error(doc["title"] + " program already exists.");
                } else {
                    await new Promise((resolve, reject) => setTimeout(() => resolve(), 3000));
                    let query = [...new Set(course["title"].replace(/('s|-|,)/g,"").replace(/\s{2,}/g," ").replace("/", " ").split(" "))].join(" ");
                    // let search = await wiki_query(query);
                    let search = course["description"];
                    let keywords = await watson_nlp(search);
                    let terms = await cortical(query);
            
                    keywords = keywords.concat(terms);
            
                    await DB.Course.create({
                        id: course["course_id"],
                        title: course["title"],
                        keywords: keywords
                    })
                    console.log(course["title"] + " course created.");
                }
                cb();
            })
        }
        await new Throttler(courses, RATE_LIMIT, RATE_LIMIT_TIME).execute(fn)
    } catch(error) {
        console.error(error.message);
    }
})

/*==============================================
              PROGRAM ENDPOINTS
 ==============================================*/
 
 /**
 * Retrieves all programs in database.
 * 
 * @name GET/programs
 * @function
 * @memberof module:routes/admin~adminRouter
 */
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

/**
 * Retrieves a single program from the database.
 * 
 * @name GET/program/:code
 * @function
 * @memberof module:routes/admin~adminRouter
 */
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

/**
 * Creates a program in the database.
 * 
 * @name POST/program/:code
 * @function
 * @memberof module:routes/admin~adminRouter
 */
Router.post("/program/:code", async(req, res) => {
    let code = req.params.code;
    let program = req.body;
    try {
        DB.Program.findOne({id: code}, async(err, doc) => {
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
            } else {
                await new Promise((resolve, reject) => setTimeout(() => resolve(), 3000));
                let query = [...new Set(program["name"].replace(/('s|-|,)/g,"").replace(/\s{2,}/g," ").replace("/", " ").split(" "))].join(" ");
                let search = await wiki_query(query);
                let keywords = await watson_nlp(search);
                let terms = await cortical(query);
        
                keywords = keywords.concat(terms);
        
                let p = await DB.Program.create({
                    id: program["code"],
                    title: program["name"],
                    keywords: keywords
                })
                console.log(program["name"] + " program created.");
                res.status(201).send(p);
            }
        });
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
})

/**
 * Updates a program in the database.
 * 
 * @name PUT/program/:code
 * @function
 * @memberof module:routes/admin~adminRouter
 */
Router.put("/program/:code", async(req, res) => {
    let code = req.params.code;
    let program = req.body;
    try {
        // Fetch keywords for program
        let query = [...new Set(program["title"].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").split(" "))].join(" ");
        let terms = await cortical(query);

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

/**
 * Deletes a program from the database.
 * 
 * @name DELETE/program/:code
 * @function
 * @memberof module:routes/admin~adminRouter
 */
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

/*==============================================
               CAREER ENDPOINTS
 ==============================================*/

/**
 * Retrieves all careers in database.
 * 
 * @name GET/careers
 * @function
 * @memberof module:routes/admin~adminRouter
 */
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

/**
 * Retrieves a single career from the database.
 * 
 * @name GET/career/:code
 * @function
 * @memberof module:routes/admin~adminRouter
 */
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

/**
 * Creates a career in the database.
 * 
 * @name POST/career/:code
 * @function
 * @memberof module:routes/admin~adminRouter
 */
Router.post("/career/:code", async(req, res) => {
    let code = req.params.code;
    let career = req.body;
    try {
        DB.Career.findOne({id: code}, async(err, doc) => {
            if(err) {
                return res.status(404).json({
                    success: false,
                    err: err
                })
            }
            if(doc) {
                return res.status(400).json({
                    success: false,
                    err: "Career already exists in database. If you wish to update this career, use PUT method."
                })
            } else {
                await new Promise((resolve, reject) => setTimeout(() => resolve(), 3000));

                let query = career["_title"] + " " + career["_description"][0].toLowerCase() + career["_description"].slice(1) + " " + career["_tasks"].join(" ") + " " + career["_technical_skills"].join(" ");
                let keywords = await watson_nlp(query);
                let terms = await cortical(career["_title"]);
        
                keywords = keywords.concat(terms);
        
                let p = await DB.Career.create({
                    id: career["_code"],
                    title: career["_title"],
                    keywords: keywords
                })
                console.log(career["_title"] + " career created.");
                res.status(201).send(p);
            }
        });
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
})

/**
 * Updates a career in the database.
 * 
 * @name PUT/career/:code
 * @function
 * @memberof module:routes/admin~adminRouter
 */
Router.put("/career/:code", async(req, res) => {
    let code = req.params.code;
    let career = req.body;
    try {
        // let query = [...new Set(career["_title"].replace(/('s|-|,)/g,"").replace(/\s{2,}/g," ").replace("/", " ").split(" "))].join(" ");
        // let search = await wiki_query(query);
        let query = career["_title"] + " " + career["_description"][0].toLowerCase() + career["_description"].slice(1) + " " + career["_tasks"].join(" ") + " " + career["_technical_skills"].join(" ");
        let keywords = await watson_nlp(query);
        let terms = await cortical(career["_title"]);

        keywords = keywords.concat(terms);

        let update = {
            title: career["title"],
            keywords: keywords
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

/**
 * Deletes a career from the database.
 * 
 * @name DELETE/career/:code
 * @function
 * @memberof module:routes/admin~adminRouter
 */
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

/*==============================================
               COURSE ENDPOINTS
 ==============================================*/

/**
 * Retrieves all courses in database.
 * 
 * @name GET/courses
 * @function
 * @memberof module:routes/admin~adminRouter
 */
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

/**
 * Retrieves a single course from the database.
 * 
 * @name GET/course/:code
 * @function
 * @memberof module:routes/admin~adminRouter
 */
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

/**
 * Creates a course in the database.
 * 
 * @name POST/course/:code
 * @function
 * @memberof module:routes/admin~adminRouter
 */
Router.post("/course/:code", async(req, res) => {
    let code = req.params.code;
    let course = req.body;
    try {
        DB.Course.findOne({id: code}, async(err, doc) => {
            if(err) {
                console.error(err);
            }
            if(doc) {
                console.error(doc["title"] + " program already exists.");
            } else {
                let query = [...new Set(course["title"].replace(/('s|-|,)/g,"").replace(/\s{2,}/g," ").replace("/", " ").split(" "))].join(" ");
                // let search = await wiki_query(query);
                let search = course["description"];
                let keywords = await watson_nlp(search);
                let terms = await cortical(query);
        
                keywords = keywords.concat(terms);
        
                await DB.Course.create({
                    id: code,
                    title: course["title"],
                    keywords: keywords
                })
                console.log(course["title"] + " course created.");
                res.status(201).send(course);
            }
        })
    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
})

/**
 * Updates a course in the database.
 * 
 * @name PUT/course/:code
 * @function
 * @memberof module:routes/admin~adminRouter
 */
Router.put("/course/:code", async(req, res) => {
    let code = req.params.code;
    let course = req.body;
    try {
        let query = [...new Set(course["title"].replace(/('s|-|,)/g,"").replace(/\s{2,}/g," ").replace("/", " ").split(" "))].join(" ");
        // let search = await wiki_query(query);
        let search = course["description"];
        let keywords = await watson_nlp(search);
        let terms = await cortical(query);

        keywords = keywords.concat(terms);

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

/**
 * Deletes a course from the database.
 * 
 * @name DELETE/course/:code
 * @function
 * @memberof module:routes/admin~adminRouter
 */
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