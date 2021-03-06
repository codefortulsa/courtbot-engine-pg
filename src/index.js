var pg = require("pg");
var courtbot = require("courtbot-engine");
var moment = require("moment");
var DBMigrate = require("db-migrate");
var log4js = require("log4js");

courtbot.setRegistrationSource(function(connectionString) {

  function getRegistrationsByContact(contact, communication_type) {
    return new Promise(function(resolve, reject) {
      pg.connect(connectionString, function(err, client, done) {
        if(err)
        {
          reject(err);
          return;
        }
        client.query('SELECT * FROM registrations WHERE contact = $1 AND communication_type = $2', [contact, communication_type], function(err, result) {
          done();
          if(err) return reject(err);
          resolve(result.rows);
        });
      });
    });
  }

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

    getRegistrationsByContact,

    getRegistrationsByPhone: function (phone) {
      log4js.getLogger("deprecated-phone-registration")
        .warning("getRegistrationsByPhone(phone) is deprecated, use getRegistrationsByContact(contact, communication_type)");
      return getRegistrationsByContact(phone, "sms");
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
          client.query('INSERT INTO registrations (contact, communication_type, name, state, case_number, create_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING registration_id',
                      [registration.contact || registration.phone, registration.communication_type || "sms", registration.name, registration.state, registration.case_number, moment().toString()],
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
    getSentMessages: function (contact, case_number) {
      return new Promise(function(resolve, reject) {
        pg.connect(connectionString, function(err, client, done) {
          if(err)
          {
            reject(err);
            return;
          }
          client.query('SELECT * FROM sent_messages WHERE contact = $1 AND case_number = $2', [contact, case_number], function(err, result) {
            done();
            if(err) return reject(err);
            resolve(result.rows);
          });
        });
      });
    },
    getSentMessage: function (contact, communication_type, name, date, description, case_number) {
      return new Promise(function(resolve, reject) {
        pg.connect(connectionString, function(err, client, done) {
          if(err)
          {
            reject(err);
            return;
          }
          client.query('SELECT * FROM sent_messages WHERE contact = $1 AND date = $2 AND (description = $3 OR description IS NULL) AND communication_type = $4 AND name = $5 AND (case_number = $6 OR case_number IS NULL)', [contact, date, description, communication_type, name, case_number], function(err, result) {
            done();
            if(err) return reject(err);
            resolve(result.rows);
          });
        });
      });
    },
    createSentMessage: function (contact, communication_type, name, date, description, case_number) {
      return new Promise(function(resolve, reject) {
        pg.connect(connectionString, function(err, client, done) {
          if(err)
          {
            reject(err);
            return;
          }
          client.query('INSERT INTO sent_messages (contact, communication_type, date, description, name, case_number) VALUES ($1,$2,$3,$4,$5,$6) RETURNING msg_id',
                      [contact, communication_type, date, description, name, case_number],
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
      var dbmigrate = DBMigrate.getInstance(true, {cwd: __dirname + "/.."});

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
      }).catch(err => {
        logger.error("Error migrating: ", err);
      });
      /* eslint-enable no-console */
    }
  };
});
