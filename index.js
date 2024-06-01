const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const mongo = require("./public/js/mongoDB.js");
const { check, validationResult } = require("express-validator");

let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'https://main--mch-flix.netlify.app', "https://codermch.github.io"];
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

app.use(morgan("common"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./public/js/auth.js')(app);
let passport = require("passport");

app.use(express.static("public"));

app.use((err, req, res, next) => {
    console.error(err.message)
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

/**
 * home page of movie-app-server
 */
app.get("/", (req, res) => {
    res.status(200).send("this is my flix backend\nrequest documentation.html for more details");
})

/**
 * get all the movies from database
 */
app.get("/movies", passport.authenticate('jwt', { session: false }), async (req, res) => {
    mongo.moviesModel.find().then(movies => {
        res.status(200).json(movies);
    }).catch(err => {
        throw new Error(err);
    })
})

/**
 * get movie by movie id
 */
app.get("/movieid/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.params;
    mongo.moviesModel.find({ "_id": id }).then(movies => {
        if (movies.length == 0) {
            res.status(400).send("No such movie");
        } else {
            res.status(200).json(movies);
        }
    }).catch(err => {
        throw new Error(err);
    })
})

/**
 * get movie details by title
*/
app.get("/movie/:title", passport.authenticate('jwt', { session: false }), (req, res) => {
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

/**
 * get movie's genre by movie title
*/
app.get("/movie/:title/genre", passport.authenticate('jwt', { session: false }), (req, res) => {
    let { title } = req.params;
    mongo.moviesModel.findOne({ "title": title }).then(movie => {
        if (movie.length == 0) {
            res.status(400).send("No such movie");
        } else {
            res.status(200).send(movie.genre.type);
        }
    }).catch(err => {
        throw new Error(err);
    })
})

/**
 * get all directors
 */
app.get("/directors", passport.authenticate('jwt', { session: false }), (req, res) => {
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

/**
 * get director's detail by director's name
 */
app.get("/director/:name", passport.authenticate('jwt', { session: false }), (req, res) => {
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

/**
 * get all users
 */
app.get("/users", passport.authenticate("jwt", { session: false }), (req, res) => {
    mongo.usersModel.find().then(users => {
        res.status(200).json(users);
    }).catch(err => {
        throw new Error(err);
    })
})

/**
 * register new user
 */
app.post("/user", [
    check("username", "Username must not empty").not().isEmpty(),
    check("password", "Password must be more than 8 characters and contains number, lower case, upper case and special character")
        .matches(/^(?=.*?[0-9])(?=.*?[A-Za-z])(?=.*[\`\~!@#$%^&*()-=_+,./<>?;':"\[\]\\{}|]).{8,}$/, "i"),
    check("email", "Invalid email formmat").isEmail()
], (req, res) => {
    let validErrs = validationResult(req);
    if (!validErrs.isEmpty()) {
        return res.status(422).json({ errors: validErrs.array() });
    }

    const newUser = req.body;
    mongo.usersModel.findOne({ "username": newUser.username }).then(user => {
        if (user) {
            res.status(400).send("User exists");
            return;
        }

        mongo.usersModel.create({
            "username": newUser.username,
            "password": mongo.usersModel.hashPassword(newUser.password),
            "email": newUser.email,
            "birthday": newUser.birthday
        }).then(createdUser => {
            res.status(201).json(createdUser);
        }).catch(createErr => {
            throw new Error(createErr);
        })
    }).catch(err => {
        throw new Error(err);
    })
})

/**
 * get user by id
 */
app.get("/user/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.params;
    mongo.usersModel.findOne({ "_id": id}).then(user => {
        res.status(200).json(user);
    }).catch(err => {
        throw new Error(err);
    })
})

/**
 * update user details
 */
app.put("/user/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    const { id } = req.params;
    const updateUser = req.body;

    mongo.usersModel.findOneAndUpdate({ "_id": id }, {
        $set: {
            "username": updateUser.username,
            "password": mongo.usersModel.hashPassword(updateUser.password),
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

/**
 * delete user
 */
app.delete("/user", passport.authenticate('jwt', { session: false }), (req, res) => {
    const deleteUser = req.body;
    if (!deleteUser.id) {
        res.status(400).send("User id is missing")
        return;
    }
    mongo.usersModel.findOneAndDelete({ "_id": deleteUser.id }).then(user => {
        if (!user) {
            res.status(400).send(user.username + ' was not found');
        } else {
            res.status(200).send(user.username + ' was deleted.');
          }
    }).catch(err => {
        res.status(500).send(err.message)
    })
})

/**
 * add favorite movies to user
*/
app.post("/user/:id/:title", passport.authenticate('jwt', { session: false }), (req, res) => {
    const { id, title } = req.params;
    mongo.moviesModel.find({ "title": title }).then(movie => {
        if (movie.length != 1) {
            res.status(400).send("No such movie");
            return;
        }
        console.log("movie id: " + movie[0]._id)
        mongo.usersModel.findOneAndUpdate({ "_id": id }, { $addToSet: {
            "favoriteMovies": movie[0]._id  // debug: id is missing in movie[0]
        }}, { new: true }
        ).then(user => {
            res.status(200).json(user);
        }).catch(findUserErr => {
            res.status(400).send(findUserErr.message);
        })
    }).catch(findMovieErr => {
        res.status(400).send(findMovieErr.message);
    })
})

/**
 * remove movie from user favorite list
 */
app.delete("/user/:id/:title", passport.authenticate('jwt', { session: false }), (req, res) => {
    const { id, title } = req.params;
    mongo.moviesModel.findOne({ "title": title }).then(movie => {
        mongo.usersModel.findOneAndUpdate({ "_id": id}, { $pull: {
            "favoriteMovies": movie._id
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
