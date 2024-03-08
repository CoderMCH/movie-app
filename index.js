const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const mongo = require("./public/js/movies.js");

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
    mongo.moviesModel.find().then(movies => {
        res.status(200).json(movies);
    }).catch(err => {
        throw new Error(err);
    })
})

// return details by movie title
app.get("/movie/:title", (req, res) => {
    let { title } = req.params;
    mongo.moviesModel.find({ "title": title }).then(movies => {
        if (movies.length == 0) {
            res.status(400).send("No such movie");
        } else {
            res.status(200).json(movies);
        }
    }).catch(err => {
        throw new Error(err);
    })
})

// return details by movie title
// debugging
app.get("/movie/:type/genre", (req, res) => {
    let { type } = req.params;
    console.log(type)
    mongo.moviesModel.find({ "genre.type": type }).then(movies => {
        // if (movies.length == 0) {
        //     res.status(400).send("No such movie");
        // } else {
        //     let mesg = "";
        //     Array.from(movies).forEach(movie => {
        //         mesg += movie.title + ":\t" + movie.genre.type + "\n";
        //     });
            res.status(200).json(movies);
        // }
    }).catch(err => {
        throw new Error(err);
    })
})

// return director list
app.get("/directors", (req, res) => {
    mongo.moviesModel.find().then(movies => {
        let directors = [];
        movies.forEach(movie => {
            if (!directors.find(director => director.bio == movie.director.bio)) {
                directors.push(movie.director);
            }
        })
        res.status(200).json(directors);
    }).catch(err => {
        throw new Error(err);
    })
})

// return director inform
app.get("/director/:name", (req, res) => {
    let { name } = req.params;
    mongo.moviesModel.find( { "director.name": name }).then(movies => {
        if (movies.length == 0) {
            res.status(400).send("No such director");
        } else {
            res.status(200).json(movies[0].director);
        }
    }).catch(err => {
        throw new Error(err);
    })
})

// user related
// register
app.post("/user", (req, res) => {
    const newUser = req.body;
    if (!newUser.username || newUser.username == "") {
        res.status(400).send("User needs name");
        return;
    }
    mongo.usersModel.findOne({ "username": newUser.username }).then(user => {
        if (user) {
            res.status(400).send("User exists");
            return;
        }

        mongo.usersModel.create({
            "username": newUser.username,
            "password": newUser.password,
            "email": newUser.email,
            "birthdate": newUser.birthdate
        }).then(createdUser => {
            res.status(201).json(createdUser);
        }).catch(createErr => {
            throw new Error(createErr);
        })
    }).catch(err => {
        throw new Error(err);
    })
})

// update user info
app.put("/user/:id", (req, res) => {
    const { id } = req.params;
    const updateUser = req.body;

    console.log("updating username");
    mongo.usersModel.findOneAndUpdate({ "_id": id }, {
        $set: {
            "username": updateUser.username,
            "password": updateUser.password,
            "email": updateUser.email,
            "birthday": updateUser.birthday
        }
    }, { new: true }   // return updated user
    ).then(user => {
            res.status(200).json(user);
    }).catch(err => {
        res.status(400).send(err.message);
    })
})

// delete user
app.delete("/user", (req, res) => {
    const deleteUser = req.body;
    if (!deleteUser.id) {
        res.status(400).send("User id is missing")
        return;
    }
    mongo.usersModel.findOneAndDelete({ "_id": deleteUser.id}).then(user => {
        if (!user) {
            res.status(400).send(user.username + ' was not found');
        } else {
            res.status(200).send(user.username + ' was deleted.');
          }
    }).catch(err => {
        res.status(500).send(err.message)
    })
})

// add favorite movies to user
app.post("/user/:id/:title", (req, res) => {
    const { id, title } = req.params;
    mongo.moviesModel.find({ "title": title }).then(movie => {
        if (movie.length != 1) throw new Error("No such movie");

        mongo.usersModel.findOneAndUpdate({ "_id": id}, { $push: {
            "favoriteMovies": movie[0]._id  // debug: id is missing in movie[0]
        }}, { new: true }
        ).then(user => {
            res.status(200).json(user);
        }).catch(findUserErr => {
            res.status(400).send("No such user");
        })
    }).catch(findMovieErr => {
        res.status(400).send(findMovieErr.message);
    })
})

// remove a movie from user list
app.delete("/user/:id/:title", (req, res) => {
    const { id, title } = req.params;
    mongo.moviesModel.find({ "title": title }).then(movie => {
        if (movie.length != 1) throw new Error("No such movie");

        mongo.usersModel.findOneAndUpdate({ "_id": id}, { $pull: {
            "favoriteMovies": movie[0]._id  // debug: id is missing in movie[0]
        }}, { new: true}
        ).then(user => {
            res.status(200).json(user);
        }).catch(findUserErr => {
            res.status(400).send("No such user");
        })
    }).catch(findMovieErr => {
        res.status(400).send(findMovieErr.message);
    })
})

app.listen(8080, () => {
    console.log("server starts");
})
