var express = require('express'),
    _       = require('lodash');
var getDb   = require('./database.js');
var pg = require('pg');

var app = module.exports = express.Router();
var db = getDb.getConnection();

app.get('/api/pcb_error_types', function(req, res) {
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

app.get('/api/pcb_test_and_retests', function(req, res) {
    var queryStr =
        "SELECT \"TimeStamp\"::date, count(*) as total_tests, count(\"Re-test\"=true OR null) as total_retests FROM pcb_test_logs WHERE \"TimeStamp\" BETWEEN '" +
        req.query.timeStart + "  00:00:00'::timestamp AND '" + req.query.timeEnd +
        " 23:59:59'::timestamp group by 1 ORDER BY 1";
    db.query(queryStr)
        .then(function (data) {
            res.status(200).send(data);
        })
        .catch(function (error) {
            return res.status(401).send("Error retrieving data");
            console.log(error);
        });
});

app.get('/api/sys_tests_pass_fail_by_tester', function(req, res) {
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

app.get('/api/sys_tests_pass_fail', function(req, res) {
    var queryStr =
        "SELECT \"Date\", count(mfg_test_all_passed = true or null) as passed, count(mfg_test_all_passed = false or null) as failed FROM sys_test_logs WHERE \"Date\" BETWEEN ' " +
        req.query.timeStart + "'::date AND '" + req.query.timeEnd + "'::date GROUP BY \"Date\" ORDER BY \"Date\"";
    db.query(queryStr)
        .then(function (data) {
            res.status(200).send(data);
        })
        .catch(function (error) {
            return res.status(401).send("Error retrieving data");
            console.log(error);
        });
});

app.get('/api/sys_tests_fail_by_type', function(req, res) {
    var queryStr =
        "SELECT \"Date\", count(mfg_test_pack_detection = false or null) as mfg_test_pack_detection," +
        "count(mfg_test_firmware_version_valid = false or null) as mfg_test_firmware_version_valid," +
        "count(mfg_test_serial_number_valid = false or null) as mfg_test_serial_number_valid," +
        "count(mfg_test_pack_volts = false or null) as mfg_test_pack_volts," +
        "count(mfg_test_cig_detect_volts = false or null) as mfg_test_cig_detect_volts," +
        "count(mfg_test_cig_volts = false or null) as mfg_test_cig_volts " +
        "FROM sys_test_logs WHERE \"Date\" BETWEEN ' " + req.query.timeStart +
        "'::date AND '" + req.query.timeEnd +
        "'::date GROUP BY \"Date\" ORDER BY \"Date\"";

    db.query(queryStr)
        .then(function (data) {
            res.status(200).send(data);
        })
        .catch(function (error) {
            return res.status(401).send("Error retrieving data");
            console.log(error);
        });
});

app.get('/api/sys_tests_retest_to_pass', function(req, res) {
    var queryStr =
        "SELECT \"Date\", count(DISTINCT(\"Serial Number\")) AS count FROM sys_test_logs " +
        "WHERE \"mfg_test_all_passed\"=TRUE AND \"Serial Number\" IN (SELECT " +
        "\"Serial Number\" FROM sys_test_logs WHERE \"mfg_test_all_passed\"=FALSE) " +
        "AND \"Date\" BETWEEN ' " + req.query.timeStart + "'::date AND '" +
        req.query.timeEnd + "'::date GROUP BY \"Date\"";

    db.query(queryStr)
        .then(function (data) {
            res.status(200).send(data);
        })
        .catch(function (error) {
            return res.status(401).send("Error retrieving data");
            console.log(error);
        });
});




app.get('/api/getHistory', function(req, res) {
    var pcbLogsQueryStr =
        "SELECT * FROM pcb_test_logs WHERE \"Serial No\"='" +
        req.query.serialNumber + "'";
    var sysLogsQueryStr =
        "SELECT * FROM sys_test_logs WHERE \"Serial Number\"='" +
        req.query.serialNumber + "'";
    var results = [];

    db.query(pcbLogsQueryStr)
        .then(function (data) {
            _.each(data, function (curRow) {
                results.push(curRow);
            });
        })
        .then(function() {
            db.query(sysLogsQueryStr)
                .then(function (data) {
                    _.each(data, function (curRow) {
                        results.push(curRow);
                    });
                })
                .then(function() {
                    res.status(200).send(JSON.stringify(results, null, '<br>'));
                })
                .catch(function (error) {
                    return res.status(401).send("Error retrieving data");
                    console.log(error);
                });
        })
        .catch(function (error) {
            return res.status(401).send("Error retrieving data");
            console.log(error);
        });
});
