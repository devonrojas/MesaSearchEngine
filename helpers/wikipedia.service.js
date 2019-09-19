require("dotenv").config();
const rp = require("request-promise");

const WIKIPEDIA_URL = "https://en.wikipedia.org/w/api.php"
let EXTRACT_OPTIONS = {
    uri: WIKIPEDIA_URL,
    method: "GET",
    json: true,
    qs: {
        action: "query",
        prop: "extracts",
        format: "json",
        explaintext: true
    }
}
let SEARCH_OPTIONS = {
    uri: WIKIPEDIA_URL,
    method: "GET",
    json: true,
    qs: {
        action: "query",
        list: "search",
        format: "json",
        srprop: "",
        srlimit: 3
    }
}

module.exports = {
    async wiki_query(str) {
        SEARCH_OPTIONS["qs"]["srsearch"] = str;
        let results = await rp(SEARCH_OPTIONS);

        let page = results["query"]["search"][0]["pageid"];
        
        EXTRACT_OPTIONS["qs"]["pageids"] = page;
        let extract = await rp(EXTRACT_OPTIONS);

        let text = extract["query"]["pages"][page]["extract"];
        return text;
    }
}