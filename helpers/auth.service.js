require("dotenv").config();
const bcrypt = require("bcrypt");
const DB = require("../db");

module.exports = async(req, res, next) => {
    if(req.get("Mesa-API")) {
        let api = Buffer.from(req.get("Mesa-API")).toString('base64');
        await DB.User.find({"username": process.env.ADMIN_USERNAME}, async(err, docs) => {
            if(err) {
                res.status(401).send("Admin account does not exist.");
            } else {
                let hash = docs[0].api;
        
                await bcrypt.compare(api, hash, (err, success) => {
                    if(success) {
                        next();
                    } else {
                        res.status(401).send("Invalid credentials.")
                    }
                })
            }
        })
    } else {
        res.sendStatus(401);
    }
}