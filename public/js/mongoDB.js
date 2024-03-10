const mongoose = require('mongoose');
const mongoUsername = "admin";
const mongoPassword = "admin";
const mongoDatabase = "myFlixDB";
const mongoUrl = `mongodb+srv://${mongoUsername}:${mongoPassword}@myflixdb.mh7m8rk.mongodb.net/${mongoDatabase}?retryWrites=true&w=majority&appName=myFlixDB`;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
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

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
  };
  
  userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
  };
  
var moviesModel = mongoose.model("movies", movieSchema);
var usersModel = mongoose.model("users", userSchema);

module.exports.moviesModel = moviesModel;
module.exports.usersModel = usersModel;
