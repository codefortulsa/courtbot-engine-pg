# courtbot-engine-pg [![Build Status](https://travis-ci.org/codefortulsa/courtbot-engine-pg.svg?branch=master)](https://travis-ci.org/codefortulsa/courtbot-engine-pg)

This is a Postgres database layer for courtbot-engine

##Usage

~~~javascript
var courbot=require("courtbot-engine");
require("courtbot-engine-pg");

...

courtbot.addRoutes(app, {
  dbUrl: databaseurl,
  <other options>
});
~~~
