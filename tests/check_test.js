var cannolo = require("../index.js");
var wrench = require("wrench");
var path = require("path");

var options = {
  title       : "TEST",
  output      : "./test_out",
  parseOptions: "./parse_options.json",
  skin: "../skins/goose/templates/layout.jade",
};

cannolo.parse(["0.8.14/nodejs_ref_guide"], options, function (err, ast) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  cannolo.render('html', ast, options, function (err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
});