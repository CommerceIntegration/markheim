var lazypipe = require('lazypipe');

var frontMatter = require('./front-matter');
var setType = require('./set-type');

module.exports = function(config) {
  return lazypipe()
    .pipe(function() {
      return frontMatter.globals(config);
    })
    .pipe(function() {
      return setType(config);
    });
};