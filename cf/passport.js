const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const User = require('../model/User')
const db2 = require('./db')



module.exports = (passport) => {
    passport.use(new LocalStrategy(
        function (username, password, done) {
            User.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) console.log(err);
                    if (isMatch) {
                        done(null, user)
                    }
                    else {
                        done(null, false, { message: "parol Xato" })
                    }
                })
            });
        }
    ));

    
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}

