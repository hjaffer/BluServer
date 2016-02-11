var pgp = require('pg-promise')(/*options*/);
//var cn = "postgres://postgres:password@localhost:5432/BluDatabase";
var cn = "postgres://awsuser:bluOl}A{4AiGw}@bludb.clpzkobnx0wr.us-west-1.rds.amazonaws.com:5432/postgres";
var database = pgp(cn);

module.exports = {
    getConnection: function () {
        return database;
    }
};
