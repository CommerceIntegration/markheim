var gutil = require('gulp-util');
var gulpIf = require('gulp-if');
var es = require('event-stream');

var merge = require('deepmerge');

var frontMatter = require('front-matter');

var parse = function() {
  return es.map(function(file, cb) {
    var contents = String(file.contents);

    /**
     * We need to test for the presence of front matter separately from
     * parsing out the front matter, because empty front matter is used
     * as an indicator that a file should go through the 'convert'
     * pipeline:
     */

    if (frontMatter.test(contents)) {
      var content = frontMatter(contents);

      file.contents = new Buffer(content.body);
      file.frontMatter = content.attributes;
    }
    cb(null, file);
  });
};

var test = function(action) {
  return gulpIf(
    function(file) {
      return 'frontMatter' in file;
    },
    action
  );
};

var collate = function(config) {
  return es.map(function(file, cb) {
    var fm = file.frontMatter;
    gutil.log('front matter found in', file.relative, '=>', fm);

    /**
     * Some front matter properties need merging:
     */

    config.front_matter.merge.map(function(variables) {
      if (!Array.isArray(fm[variables[0]])) {
        fm[variables[0]] = [fm[variables[0]]];
      }
      if (!Array.isArray(fm[variables[1]])) {
        fm[variables[1]] = [fm[variables[1]]];
      }
      fm[variables[0]] = merge(fm[variables[0]], fm[variables[1]]);
      delete fm[variables[1]];
    });

    /**
     * Some properties are space-separated lists that need splitting:
     */

    config.front_matter.split.map(function(variable) {
      if (!Array.isArray(fm[variable])) {
        fm[variable] = [fm[variable]];
      }
      fm[variable] = fm[variable]
        .map(
          function(s) {
            return (s) ? s.split(/\s/) : '';
          }
        );
    });

    /**
     * Some properties may have nested arrays that need flattening:
     */

    config.front_matter.flatten.map(function(variable) {
      if (!Array.isArray(fm[variable])) {
        fm[variable] = [fm[variable]];
      }
      fm[variable] = fm[variable]
        .reduce(
          function(a, b) {
            if (!b) {
              return a;
            }
            return a.concat(b);
          }
        );
    });
    cb(null, file);
  });
};

exports.parse = parse;
exports.test = test;
exports.collate = collate;
