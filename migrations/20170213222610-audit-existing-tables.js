'use strict';

let migrate = require("../baseMigration");
let script = "20170213222610-audit-existing-tables";

module.exports = {
    setup: migrate._setup,
    up: migrate._up(`${script}-up.sql`),
    down: migrate._down(`${script}-down.sql`),
    _meta: {
        "version": 1
    }
};
