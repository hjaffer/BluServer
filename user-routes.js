var express = require('express'),
    _       = require('lodash'),
    config  = require('./config'),
    jwt     = require('jsonwebtoken'),
    bcrypt  = require('bcrypt-nodejs'),
    moment  = require('moment-timezone'),
    getDb   = require('./database.js');
var app = module.exports = express.Router();
var db = getDb.getConnection();

function createToken(user) {
    return jwt.sign(_.omit(user, 'password'), config.secret, { expiresIn: 60*5 }); // expires in seconds
}

app.post('/users', function(req, res) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).send("You must send the username and the password");
    }
    req.body.password = bcrypt.hashSync(req.body.password);
    db.one("select * from users where username=$1", req.body.username)
        .then(function (data) {
            return res.status(400).send("A user with that username already exists");
        })
        .catch(function (error) {
            db.none("insert into users(username, password) values($1, $2)", [req.body.username, req.body.password])
                .then(function () {
                    res.status(201).send({
                        id_token: createToken(req.body)
                    });
                })
            .catch(function (error) {
                return res.status(400).send(error);
            });
        });
});

app.post('/sessions/create', function(req, res) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).send("You must send the username and the password");
    }
    db.one("select * from users where username=$1", req.body.username)
        .then(function (data) {
            if (bcrypt.compareSync(req.body.password, data.password)) { // valid password
                // store login into database
                db.none("insert into user_sessions(username, login_timestamp) values($1, $2)",
                    [req.body.username, moment.tz('America/Los_Angeles').format()])
            } else { // invalid password
                throw "Error: Incorrect password for user";
            }
        }).then(function (data) {
            // send a JWT token back to the client
            res.status(201).send({
                id_token: createToken(req.body)
            });
        }).catch(function (error) {
            if (typeof(error) === 'object' &&
                    error["name"].indexOf("QueryResultError") > -1) {
                return res.status(401).send("Error: invalid username");
            } else {
                return res.status(401).send(error);
            }
        });
});
