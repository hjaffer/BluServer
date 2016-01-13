var express = require('express'),
    _       = require('lodash');
var getDb   = require('./database.js');

var app = module.exports = express.Router();
var db = getDb.getConnection();

app.get('/api/random-quote', function(req, res) {
	//res.send("Received query param: " + req.query.timeStart + " option: " + req.query.timeEnd);
  	//res.status(200).send(quoter.getRandomOne());
    var queryStr =
        "SELECT \"Error Description\", COUNT (\"Error Description\") " +
        "FROM pcb_test_logs WHERE \"TimeStamp\" BETWEEN '" + req.query.timeStart +
        "'::timestamp AND '" + req.query.timeEnd +"'::timestamp" +
        " GROUP BY \"Error Description\";";
    db.query(queryStr)
        .then(function (data) {
            var results = [];
            _.each(data, function (curRow) {
                var nameAndCount = new Object();
                nameAndCount["Error"] = curRow["Error Description"];
                nameAndCount["count"] = parseInt(curRow["count"]);
                if (nameAndCount["Error"].indexOf("No Errors") === -1) {
                    results.push(nameAndCount);
                }
            });
            console.log(JSON.stringify(results));
            res.status(200).send(JSON.stringify(results));
        })
        .catch(function (error) {
            return res.status(401).send("Error retrieving data");
            console.log(error);
        });
    /*
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
        console.log(result);
    	client.end.bind(client)
	});*/
});
