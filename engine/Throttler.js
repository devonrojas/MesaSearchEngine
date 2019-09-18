/**
 * @module models/Throttler
 * @author Devon Rojas
 * 
 */

/**
 * Class containing logic to throttle a large number of function executions.
 */
class Throttler {
    /**
     * 
     * @param {Array}   arr                     Array of items to perform an operation on
     * @param {number}  [rateLimitCount=1]      Number of executions to perform per rateLimitTime
     * @param {number}  [rateLimitTime=1000]    Amount of time (in milliseconds) to wait between execution batches
     */
    constructor(arr = [], rateLimitCount = 1, rateLimitTime = 1000) {
        /** @private */
        this.arr = arr;
        /** @private */
        this.rateLimitCount = rateLimitCount;
        /** @private */
        this.rateLimitTime = rateLimitTime;
    }

    /**
     * Executes, in batch sizes specified in the {@link module:models/Throttler#constructor|constructor}, a
     * callback function on each item in the Throttler's item array.
     * 
     * @async
     * @see {@link module:helpers/Utils~throttle|Utils.throttle()}
     * 
     * @param {Function} callbackFn An _asynchronous_ callback function to perform on each item - Must handle two arguments, (cb, item), 
     * with cb being a returned function and item being the current item from the array.
     * 
     * @example A sample callbackFn argument.
     * async callbackFn(cb, item) => {
     *      // Perform some operation on item
     *      cb();
     * }
     * 
     * @return {Array} Resulting response array from throttled callback functions.
     */
    async execute(callbackFn) {
        let calls = [];
        let startTime = Date.now();

        await asyncForEach(this.arr, async(item, index) => {
            calls.push(async(cb) => callbackFn(cb, item, index));
        })

        let p = await throttle(calls, this.rateLimitCount, this.rateLimitTime);
        let endTime = (Date.now() - startTime) / 1000;
        if(endTime > 100) {
            console.log("Elapsed time: " + (endTime / 60) + " minutes.");
        } else {
            console.log("Elapsed time: " + (endTime) + " seconds.");
        }
        return p;
    }
}

/**
 * Asynchronously executes callback functions per the rateLimitCount and rateLimitTime
 * values passed in to the function.
 * 
 * @async
 * @param {Array}   calls           Array of calls to execute
 * @param {number}  rateLimitCount  Amount of calls to make sychronously
 * @param {number}  rateLimitTime   Amount of time to wait between batches
 * 
 * @return {Array}  Reponse data from all calls.
 */
async function throttle(calls, rateLimitCount, rateLimitTime) {
    const totalCalls = calls.length;
    console.log(`Total calls: ${totalCalls}`);
    let p = [];
    let i = 1;
    while(calls.length > 0) {
        // Take a call chunk specified by rateLimitCount
        let callstoExecute = calls.slice(0, rateLimitCount);
        // Remove that chunk from original call array
        calls = calls.slice(rateLimitCount, calls.length);

        let promises = [];
        callstoExecute.forEach((call) => {
            promises.push(new Promise((resolve, reject) => {
                console.log("Executing call " + i + "/" + totalCalls);
                call(resolve);
                i++;
            }))
        });

        // Execute all promises in call chunk
        let res = await Promise.all(promises);
        // Combine response with any previous response data
        p = p.concat(res);
        // Wait for rateLimitTime to pass before moving on to next call chunk
        await timeout(rateLimitTime);
    }
    return p;
}

/**
 * Sets a timeout.
 * 
 * @param {number} ms   Amount of time in milliseconds to wait. 
 * @return {Promise}    A completed Promise after timeout finishes.
 */
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const asyncForEach = async(arr, cb) => {
    for(let i = 0; i < arr.length; i++) {
        await cb(arr[i], i, arr);
    }
}

module.exports = Throttler;