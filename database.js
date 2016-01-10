var pgp = require('pg-promise')(/*options*/);
var cn = "postgres://postgres:password@localhost:5432/BluDatabase";
var database = pgp(cn);

module.exports = {
    getConnection: function () {
        return database;
    }
};

//module.exports = pgp(cn);
console.log('here');
