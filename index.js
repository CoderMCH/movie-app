const express = require("express");
const morgan = require("morgan");
const app = express();

let moviesFavorite = {
    "YT channels for programmer": ["Net Ninja", "The Cherno", "Computerphile", "Jacob Sorber", "freeCodeCamp.org"]
}

app.use(morgan("common"));

app.use(express.static("public"));

app.use((err, req, res, next) => {
    console.error(err.message)
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

app.get("/movie", (req, res) => {
    res.json(moviesFavorite);
})

app.get("/", (req, res) => {
    res.send("testual result");
})

// used to trigger error handling
app.get("/error", (req, res) => {
    throw new Error("This is an error");
})



app.listen(8080, () => {
    console.log("server starts");
})
