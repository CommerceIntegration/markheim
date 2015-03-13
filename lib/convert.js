var lazypipe = require('lazypipe');

var frontMatter = require('./front-matter');

module.exports = function(config) {
  return lazypipe()
    .pipe(function() {
      return frontMatter.globals(config);
    });
};