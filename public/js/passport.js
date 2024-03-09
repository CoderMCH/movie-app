const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const mongo = require("./movies.js");

let usersModel = mongo.usersModel;
let jwtStrategy = passportJWT.Strategy;
let extractJwt = passportJWT.extractJwt;

passport.use(
    new localStrategy(
        {
            usernameField: "username",
            passwordField: "password",
        },
        async (username, password, callback) => {
            console.log(`${username} ${password}`);
            await usersModel.findOne({ "username": username }).then(user => {
                if (!user) {
                    console.log("incorrect username");
                    return callback(null, false, {
                        message: "Incorrect username or password."
                    })
                }
                console.log("login success\n" + user.username + ": " + user.password);
                return callback(null, user);
            }).catch(err => {
                console.error(err);
                return callback(err);
            })
        }
    )
);

passport.use(
    new jwtStrategy({
        jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: "jwt_secret"
    }, async (jwtPayload, callback) => {
        return await usersModel.findById(jwtPayload._id).then(user => {
            return callback(null, user);
        }).catch(err => {
            return callback(err);
        })
    })
)
