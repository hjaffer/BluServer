var express = require('express'),
    jwt     = require('express-jwt'),
    config  = require('./config');

var app = module.exports = express.Router();
var pg = require("pg");
var conString = "pg://postgres:password@localhost:5432/BluDatabase";
var client = new pg.Client(conString);
client.connect();

var jwtCheck = jwt({
    secret: config.secret
});

app.use('/api/protected', jwtCheck);

// Format is Authorization: Bearer [token]
app.get('/api/protected/random-quote', function(req, res) {
    var queryStr =
        "SELECT \"Error Description\", COUNT (\"Error Description\") " +
        "FROM pcb_test_logs WHERE \"TimeStamp\" BETWEEN '" + req.query.timeStart +
        "'::timestamp AND '" + req.query.timeEnd +"'::timestamp" +
        " GROUP BY \"Error Description\";";
    console.log(queryStr);
    var query = client.query(queryStr);

    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        client.end.bind(client)
        res.status(200).send(JSON.stringify(result.rows));
    });
    query.on("error", function (result) {
        return res.status(401).send("Error retrieving data");
        client.end.bind(client)
    });
});
