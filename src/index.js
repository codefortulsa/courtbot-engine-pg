var pg = require("pg");
var courtbot = require("courtbot-engine");
var moment = require("moment");
var DBMigrate = require("db-migrate");
var log4js = require("log4js");

courtbot.setRegistrationSource(function(connectionString) {
  return {
    getRegistrationById: function (id) {
      return new Promise(function(resolve, reject) {
        pg.connect(connectionString, function(err, client, done) {
          if(err)
          {
            reject(err);
            return;
          }
          client.query('SELECT * FROM registrations WHERE registration_id = $1', [id], function(err, result) {
            done();
            if(err) return reject(err);
            if(result.rows.length == 1){
               resolve(result.rows[0]);
             }
             else {
               resolve();
             }
          });
        });
      });
    },

    getRegistrationsByPhone: function (phone) {
      return new Promise(function(resolve, reject) {
        pg.connect(connectionString, function(err, client, done) {
          if(err)
          {
            reject(err);
            return;
          }
          client.query('SELECT * FROM registrations WHERE phone = $1', [phone], function(err, result) {
            done();
            if(err) return reject(err);
            resolve(result.rows);
          });
        });
      });
    },

    getRegistrationsByState: function (state) {
      return new Promise(function(resolve, reject) {
        pg.connect(connectionString, function(err, client, done) {
          if(err)
          {
            reject(err);
            return;
          }
          client.query('SELECT * FROM registrations WHERE state = $1', [state], function(err, result) {
            done();
            if(err) return reject(err);
            resolve(result.rows);
          });
        });
      });
    },

    createRegistration: function (registration) {
      return new Promise(function(resolve, reject) {
        pg.connect(connectionString, function(err, client, done) {
          if(err)
          {
            reject(err);
            return;
          }
          client.query('INSERT INTO registrations (phone, name, state, case_number, create_date) VALUES ($1,$2,$3,$4,$5) RETURNING registration_id',
                      [registration.phone, registration.name, registration.state, registration.case_number, moment().toString()],
                      function(err, result) {
                        done();
                        if(err) return reject(err);
                        if(result.rows.length == 1){
                          resolve(result.rows[0].registration_id);
                        }
                        else {
                          resolve();
                        }
                      });
        });
      });
    },
    updateRegistrationName: function (id, name) {
      return new Promise(function(resolve, reject) {
        pg.connect(connectionString, function(err, client, done) {
          if(err)
          {
            reject(err);
            return;
          }
          client.query('UPDATE registrations SET name = $2 WHERE registration_id = $1', [id, name], function(err, result) {
            done();
            if(err) return reject(err);
            resolve(result);
          });
        });
      });
    },
    updateRegistrationState: function (id, state) {
      return new Promise(function(resolve, reject) {
        pg.connect(connectionString, function(err, client, done) {
          if(err)
          {
            reject(err);
            return;
          }
          client.query('UPDATE registrations SET state = $2 WHERE registration_id = $1', [id, state], function(err, result) {
            done();
            if(err) return reject(err);
            resolve(result);
          });
        });
      });
    },

    getSentMessage: function (phone, name, date, description) {
      return new Promise(function(resolve, reject) {
        pg.connect(connectionString, function(err, client, done) {
          if(err)
          {
            reject(err);
            return;
          }
          client.query('SELECT * FROM registrations WHERE phone = $1 AND name = $2 AND date = $3 AND description = $4', [phone, name, date, description], function(err, result) {
            done();
            if(err) return reject(err);
            resolve(result.rows);
          });
        });
      });
    },
    createSentMessage: function (phone, name, date, description) {
      return new Promise(function(resolve, reject) {
        pg.connect(connectionString, function(err, client, done) {
          if(err)
          {
            reject(err);
            return;
          }
          client.query('INSERT INTO sent_messages (phone, name, date, description) VALUES ($1,$2,$3,$4) RETURNING message_id',
                      [phone, name, date, description],
                      function(err, result) {
                        done();
                        if(err) return reject(err);
                        if(result.rows.length == 1){
                          resolve(result.rows[0].message_id);
                        }
                        else {
                          resolve();
                        }
                      });
        });
      });
    },
    migrate: function() {
      var dbmigrate = DBMigrate.getInstance(true, {cwd: __dirname});

      //monkey patch
      /* eslint-disable no-console */
      var oldLog = console.log;
      var oldInfo = console.info;
      var oldError = console.error;
      var oldWarn = console.warn;
      const logger = log4js.getLogger("db-migrate");

      console.log = function (){ logger.debug.apply(logger, arguments); }
      console.info = function (){ logger.info.apply(logger, arguments); }
      console.error = function (){ logger.error.apply(logger, arguments); }
      console.warn = function (){ logger.warn.apply(logger, arguments); }

      return dbmigrate.up().then(() => {
        //un-monkey patch
        console.log = oldLog;
        console.info = oldInfo;
        console.error = oldError;
        console.warn = oldWarn;
      });
      /* eslint-enable no-console */
    }
  };
});