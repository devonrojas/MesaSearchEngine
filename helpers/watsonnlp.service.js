require("dotenv").config();
const rp = require("request-promise");

const WATSON_URL = "https://gateway.watsonplatform.net/natural-language-understanding/api/v1/analyze?version=2019-07-12";
const WATSON_HEADERS = {
    Authorization: 'Basic ' + Buffer.from(process.env.WATSON_API_KEY).toString('base64'),
    "Content-Type": "application/json"
}
let WATSON_OPTIONS = {
    uri: WATSON_URL,
    method: 'POST',
    headers: WATSON_HEADERS,
    json: true
}

module.exports = {
    async watson_nlp(text, threshold = 0.5) {
        WATSON_OPTIONS["body"] = {
            text: text,
            features: {
                concepts: {
                    limit: 50
                },
                keywords: {
                    limit: 50
                }
            }
        }

        let res = await rp(WATSON_OPTIONS);
        res = [].concat(res["keywords"], res["concepts"]);
        let keywords = res
        .filter(item => item["relevance"] > threshold)
        .map(item => item["text"]);

        return keywords;
    }
}