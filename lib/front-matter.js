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
     * 'internals' variables are values for the SSG processor that don't get
     * pushed through to templates. These values can be set in config and
     * overridden in front matter:
     */

    var internals = file[config.ssg] = {};

    config.front_matter.internals.map(function(variable) {
      internals[variable] = fm[variable] || config[variable];
      delete fm[variable];
    });

    /**
     * 'page' variables are those for the page being processed and can only
     * come from front matter. Note that we remove the variables we know about
     * so that anything left is a custom variable:
     */

    var page = {};

    config.front_matter.page.map(function(variable) {
      page[variable] = fm[variable];
      delete fm[variable];
    });

    /**
     * Merge in custom variable:
     */

    page = merge(page, fm);

    /**
     * Finally set 'globals' to be an amalgam of 'site', 'page', 'content' and 'paginator':
     */

    file.globals = {
      site: config,
      page: page,
      content: null,
      paginator: null
    };

    gutil.log('  =>', file.globals.page);
    cb(null, file);
  });
};

exports.parse = parse;
exports.test = test;
exports.collate = collate;
