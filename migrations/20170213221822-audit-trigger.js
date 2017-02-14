'use strict';

let migrate = require("../baseMigration");
let script = "20170213221822-audit-trigger";

module.exports = {
    setup: migrate._setup,
    up: migrate._up(`${script}-up.sql`),
    down: migrate._down(`${script}-down.sql`),
    _meta: {
        "version": 1
    }
};
