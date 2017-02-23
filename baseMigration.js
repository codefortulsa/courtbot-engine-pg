'use strict';

var dbm;
var type;
var seed;
var fs = require('fs');
var path = require('path');
var Promise;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports._setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
    Promise = options.Promise;
};

exports._up = function (sql) {
    return function (db) {
        var filePath = path.join(__dirname, 'migrations/sqls', sql);
        return new Promise(function (resolve, reject) {
            fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
                if (err) return reject(err);
                console.log('received data: ' + data);

                resolve(data);
            });
        })
            .then(function (data) {
                return db.runSql(data);
            });
    };
};

exports._down = function (sql) {
    return function (db) {
        var filePath = path.join(__dirname, 'migrations/sqls', sql);
        return new Promise(function (resolve, reject) {
            fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
                if (err) return reject(err);
                console.log('received data: ' + data);

                resolve(data);
            });
        })
            .then(function (data) {
                return db.runSql(data);
            });
    };
};
