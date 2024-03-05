const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const app = express();

var repositories = process.cwd() + "\\public\\repositories\\";
var movies = {
    "movies": []
};
fs.readdir(repositories + "movies", (err, files) => {
    if (err) throw err;

    files.forEach(file => {
        fs.readFile(repositories + "\\movies\\" + file, (err, data) => {
            movies.movies.push(JSON.parse(data));
        })
    })
})

var directors = {
    "directors": []
}
fs.readdir(repositories + "directors", (err, files) => {
    if (err) throw err;

    files.forEach(file => {
        fs.readFile(repositories + "\\directors\\" + file, (err, data) => {
            directors.directors.push(JSON.parse(data));
        })
    })
})

var users = {
    "users": []
};
fs.readdir(repositories + "users", (err, files) => {
    if (err) throw err;

    files.forEach(file => {
        fs.readFile(repositories + "\\users\\" + file, (err, data) => {
            users.users.push(JSON.parse(data));
        })
    })
})

app.use(morgan("common"));

app.use(bodyParser.json());

app.use(express.static("public"));

app.use((err, req, res, next) => {
    console.error(err.message)
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
    res.status(200).send("testual result");
})

// return movie list
app.get("/movies", (req, res) => {
    res.status(200).json(movies);
})

// return details by movie name
app.get("/movie/:name", (req, res) => {
    let { name } = req.params;
    let movie = movies.movies.find(movie => movie.name == name);
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send("No such movie");
    }
})

// return details by movie name
app.get("/movie/:name/genre", (req, res) => {
    let { name } = req.params;
    let movie = movies.movies.find(movie => movie.name == name);
    if (movie) {
        res.status(200).send(movie.genre);
    } else {
        res.status(400).send("No such movie");
    }
})

// return director list
app.get("/directors", (req, res) => {
    res.status(200).json(directors);
})

// return director inform
app.get("/director/:name", (req, res) => {
    let { name } = req.params;
    let director = directors.directors.find(director => director.name == name);
    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send("No such director");
    }
})

// user related
// register
app.post("/user", (req, res) => {
    const newUser = req.body;
    if (newUser.name) {
        let user = users.users.find(user => user.name == newUser.name);
        if (!user) {
            newUser.favoriteMovies = [];
            newUser.id = uuid.v4();
            users.users.push(newUser);
            res.status(201).json(newUser);
            fs.writeFile(repositories + "\\users\\" + newUser.name + ".json", JSON.stringify(newUser),
                (err) => {if (err) throw err;}
            )
        } else {
            res.status(400).send("User exists");
        }
    } else {
        res.status(400).send("User needs name");
    }
})

// update user info
app.put("/user/:id", (req, res) => {
    const { id } = req.params;
    const updateUser = req.body;

    let user = users.users.find(user => user.id == id);
    if (user) {
        let dirPath = repositories + "\\users\\";
        fs.rename(dirPath + user.name + ".json", dirPath + updateUser.name + ".json", () => {
            user.name = updateUser.name;
            fs.writeFile(dirPath + user.name + ".json", JSON.stringify(user), (err) => {
                if (err) throw err;
                res.status(200).json(user);
            })
        })
    } else {
        res.status(400).send("User not exist");
    }
})

// delete user
app.delete("/user", (req, res) => {
    const deleteUser = req.body;
    if (!deleteUser.id) {
        res.status(400).send("User id is missing")
        return;
    }

    let user = users.users.find(user => user.id == deleteUser.id);
    if (!user) return;
    users = users.users.filter(user => user.id !== deleteUser.id);
    console.log("users: [ " + users + " ]");
    let filePath = repositories + "\\users\\" + user.name + ".json";
    fs.rm(filePath, () => {});
    res.status(200).send("User has been removed");
})

// add favorite movies to user
app.post("/user/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.users.find(user => user.id == id);
    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).json(user);
    } else {
        res.status(400).send("User not exists");
    }
})

// remove a movie from user list
app.delete("/user/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.users.find(user => user.id == id);
    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
        res.status(200).json(user);
    } else {
        res.status(400).send("User not exists");
    }
})


// used to trigger error handling
app.get("/error", (req, res) => {
    throw new Error("This is an error");
})



app.listen(8080, () => {
    console.log("server starts");
})
