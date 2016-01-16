var express = require('express'),
    _       = require('lodash');
var getDb   = require('./database.js');
var pg = require('pg');

var app = module.exports = express.Router();
var db = getDb.getConnection();

app.get('/api/random-quote', function(req, res) {
    var queryStr =
        "SELECT \"Error Description\" AS error, COUNT (\"Error Description\") as count " +
        "FROM pcb_test_logs WHERE \"TimeStamp\" BETWEEN '" + req.query.timeStart +
        "  00:00:00'::timestamp AND '" + req.query.timeEnd +" 23:59:59'::timestamp" +
        " GROUP BY \"Error Description\";";
    db.query(queryStr)
        .then(function (data) {
            var results = [];
            _.each(data, function (curRow) {
                if (curRow["error"].indexOf("No Errors") === -1) {
                    results.push(curRow);
                }
            });
            res.status(200).send(JSON.stringify(results));
        })
        .catch(function (error) {
            return res.status(401).send("Error retrieving data");
            console.log(error);
        });
});

app.get('/api/random-quote2', function(req, res) {
    var queryStr =
        "SELECT \"TimeStamp\"::date, count(*) as total_tests, count(\"Re-test\"=true OR null) as total_retests FROM pcb_test_logs WHERE \"TimeStamp\" BETWEEN '" +
        req.query.timeStart + "  00:00:00'::timestamp AND '" + req.query.timeEnd +
        " 23:59:59'::timestamp group by 1 ORDER BY 1";
    console.log(queryStr);
    db.query(queryStr)
        .then(function (data) {
            res.status(200).send(data);
        })
        .catch(function (error) {
            return res.status(401).send("Error retrieving data");
            console.log(error);
        });
});

app.get('/api/random-quote3', function(req, res) {
    var queryStr =
        "SELECT \"Date\", \"Tester ID\", count(mfg_test_all_passed = true or null) as passed, count(mfg_test_all_passed = false or null) as failed FROM sys_test_logs WHERE \"Date\" BETWEEN '" +
        req.query.timeStart + "'::date AND '" + req.query.timeEnd + "'::date GROUP BY \"Date\", \"Tester ID\" ORDER BY \"Date\", \"Tester ID\"";
    db.query(queryStr)
        .then(function (data) {
            res.status(200).send(data);
        })
        .catch(function (error) {
            return res.status(401).send("Error retrieving data");
            console.log(error);
        });
});
