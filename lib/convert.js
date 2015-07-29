var path = require('path');

var gutil = require('gulp-util');
var gulpIf = require('gulp-if');
var es = require('event-stream');
var lazypipe = require('lazypipe');

var frontMatter = require('./front-matter');
var permalink = require('./permalink');
var setType = require('./set-type');
var templatize = require('./templatize');
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
    })

    /**
     * The following sequence is a hack since we really want to loop until
     * there is no more front matter. But for now we'll just process the
     * templates twice:
     */

    .pipe(function() {
      return templatize(shared);
    })
    .pipe(function() {
      return frontMatter.parse();
    })
    .pipe(function() {
      return frontMatter.collate(shared.config);
    })
    .pipe(function() {
      return globals.collate(shared);
    })
    .pipe(function() {
      return templatize(shared);
    });
};