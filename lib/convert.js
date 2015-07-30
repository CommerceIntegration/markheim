var path = require('path');

var gutil = require('gulp-util');
var gulpIf = require('gulp-if');
var es = require('event-stream');
var lazypipe = require('lazypipe');

var frontMatter = require('./front-matter');
var setType = require('./set-type');
var templatize = require('./templatize');
var globals = require('./globals');

module.exports = function(shared) {
  return lazypipe()
    .pipe(function() {
      return frontMatter.collate(shared.config);
    })

    /**
     * Grab the excerpt:
     */

    .pipe(function() {
      return es.map(function(file, cb) {
        var excerpt_separator = shared.config.excerpt_separator;

        if (excerpt_separator) {
          var re = new RegExp('([^]*)' + excerpt_separator);
          var content = String(file.contents);
          var match = re.exec(content);

          if (match && match[1]) {
            file.excerpt = match[1];
          }
        }
        cb(null, file);
      });
    })

    /**
     * If the file is a Markdown file then process accordingly:
     */

    .pipe(function() {
      return es.map(function(file, cb) {
        var markdownExtensions = shared.config.markdown_ext.split(',');
        var extname = path.extname(file.relative).substring(1);
        if (markdownExtensions.indexOf(extname) !== -1) {
          var md = require('markdown-it')();
          var content = String(file.contents);
          var result = md.render(content);

          file.contents = new Buffer(result);
          file.path = gutil.replaceExtension(file.path, '.html');
        }
        cb(null, file);
      });
    })
    .pipe(function() {
      return globals.collate(shared);
    })
    .pipe(function() {
      return setType(shared.config);
    })

    /**
     * The following sequence is a hack since we really want to loop until
     * there is no more front matter. But for now we'll just process the
     * templates twice:
     */

    .pipe(function() {
      return templatize(shared);
    })

    /**
     * If the file is a SASS file then process accordingly:
     */

    .pipe(function() {
      return es.map(function(file, cb) {
        var extname = path.extname(file.relative);
        if (extname === '.scss') {
          var sass = require('node-sass');
          var content = String(file.contents);
          var result = sass.renderSync({
            data: content,
            includePaths: [shared.config.paths.sass]
          });
          file.contents = result.css;
          file.path = gutil.replaceExtension(file.path, '.css');
        }
        cb(null, file);
      });
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