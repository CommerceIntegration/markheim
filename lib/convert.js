var gulpIf = require('gulp-if');
var lazypipe = require('lazypipe');

var frontMatter = require('./front-matter');
var permalink = require('./permalink');
var setType = require('./set-type');
var globals = require('./globals');

module.exports = function(shared) {
  return lazypipe()
    .pipe(function() {
      return frontMatter.collate(shared.config);
    })
    .pipe(function() {
      return globals.collate(shared);
    })
    .pipe(function() {
      return setType(shared.config);
    })
    .pipe(function() {
      return permalink(shared.config);
    });
};