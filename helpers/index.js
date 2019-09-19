/**
 * @module helpers
 * @author Devon Rojas
 * 
 * @requires service/wikipedia
 * @requires service/watson_nlp
 * @requires service/cortical
 */

// Module imports
const { wiki_query } = require("./wikipedia.service");
const { watson_nlp } = require("./watsonnlp.service");
const { cortical } = require("./cortical.service");

/**
 * Asynchronously executes a callback function for each element in an array.
 * 
 * @param {Array} arr 
 * @param {Function} cb 
 */
const asyncForEach = async(arr, cb) => {
    for(let i = 0; i < arr.length; i++) {
        await cb(arr[i], i, arr);
    }
}

/**
 * Removes all stop words from a string.
 * 
 * @param {String} str 
 */
const clean_stop_words = async(str) => {
    let stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now'];
    let res = [];
    let words = str.split(" ");
    words.forEach(word => {
        if(!stopwords.includes(word)) {
            res.push(word)
        }
    }) 
    return(res.join(' '));
}

module.exports = {
    asyncForEach,
    clean_stop_words,
    wiki_query,
    watson_nlp,
    cortical
}