var gulpIf = require('gulp-if');
var lazypipe = require('lazypipe');

var frontMatter = require('./front-matter');
var globals = require('./globals');

module.exports = function(shared) {
  return lazypipe()
    .pipe(function() {
      return frontMatter.collate(shared.config);
    })
    .pipe(function() {
      return globals.collate(shared);
    });
};