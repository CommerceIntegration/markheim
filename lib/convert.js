var lazypipe = require('lazypipe');

var frontMatter = require('./front-matter');
var setType = require('./set-type');
var globals = require('./globals');

module.exports = function(config) {
  return lazypipe()
    .pipe(function() {
      return frontMatter.collate(config);
    })
    .pipe(function() {
      return globals.collate(config);
    })
    .pipe(function() {
      return setType(config);
    });
};