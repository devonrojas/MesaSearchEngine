const PORT = process.env.PORT || 9000;

const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

const SEARCH_DATA = require("./search.json");

app.get("/", (req, res) => {
    res.sendStatus(200);
})

app.get("/search", (req, res) => {
    res.status(200).send(SEARCH_DATA);
})

app.listen(PORT, () => console.log(`App running on port: ${PORT}.`));