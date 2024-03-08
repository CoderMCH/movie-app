const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/moviesDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("connect success");
    }).catch(err => {
        console.error(err);
    });

var movieSchema = mongoose.Schema({
    "title": { type: String, required: true },
    "description": { type: String, required: true },
    "imagePath": String,
    "featured": Boolean,
    "genre": {
        "type": {"type": String},
        "descritpion": String
    },
    "director": {
        "name": String,
        "bio": String,
        "birthday": Date,
        "deathday": Date
    },
    "actors": [{
        "name": String,
        "bio": String,
        "birthday": Date,
        "deathday": Date
    }]
})

var userSchema = mongoose.Schema({
    "username": { type: String, required: true },
    "password": { type: String, required: true },
    "email": { type: String, required: true },
    "birthday": Date,
    "favoriteMovies": [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
})

var moviesModel = mongoose.model("movies", movieSchema);
var usersModel = mongoose.model("users", userSchema);

module.exports.moviesModel = moviesModel;
module.exports.usersModel = usersModel;
