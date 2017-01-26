# courtbot-engine-pg [![Build Status](https://travis-ci.org/codefortulsa/courtbot-engine-pg.svg?branch=master)](https://travis-ci.org/codefortulsa/courtbot-engine-pg)  [![npm](badges/npm.png)](https://www.npmjs.com/package/courtbot-engine-pg)

This is a Postgres database layer for courtbot-engine

##Usage

~~~javascript
var courbot=require("courtbot-engine");
require("courtbot-engine-pg");

...

app.use("/sms", courbot.routes({
  dbUrl: databaseurl,
  <other options>
}));
~~~
