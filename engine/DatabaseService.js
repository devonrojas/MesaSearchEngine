const MONGODB_URI = process.env.MONGODB_URI;
const MongoClient = require("mongodb").MongoClient;

var DB;

MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if(err) throw err;
    
    DB = client.db("heroku_j0vnvzl6");
});
process.on("SIGTERM", () => {
    DB.close();
})

const insertOne = async(collectionName, item) => {
    let collection = await DB.collection(collectionName);
    await collection.replaceOne(item);
}

module.exports = {
    insertOne
}