require("dotenv").config();
const rp = require("request-promise");
const CORTICAL_URI = "http://api.cortical.io:80/rest/";
const Throttler = require("../engine/Throttler");
const RATE_LIMIT = 1;
const RATE_LIMIT_TIME = 15000;

module.exports = {
    async cortical(query) {
        let options = {
            uri: CORTICAL_URI + "terms/similar_terms",
            json: true,
            headers: {
                "api-key": process.env.CORTICAL_API
            },
            qs: {
                retina_name: "en_associative",
            }
        }
        let terms = [];

        try {
            query = query.split(" ");
            if(query.length > 1) {
                const fn = async(cb, term) => {
                    try {
                        options["qs"]["term"] = term;
                        let kwrds = await rp(options);
                        cb(kwrds);
                    } catch(error) {
                        console.error(error.message);
                        cb();
                    }
                }

                await new Promise((resolve, reject) => setTimeout(() => resolve(), 5000))
                terms = await new Throttler(query, RATE_LIMIT, RATE_LIMIT_TIME).execute(fn);
                terms = [].concat.apply([], terms);
            } else {
                options["qs"]["term"] = query[0];
                terms = await rp(options);
            }
        } catch(error) {
            console.error(error.message);
        } finally {
            terms = terms.filter(term => term).map(term => term["term"]);
            return terms;
        }
    }
}