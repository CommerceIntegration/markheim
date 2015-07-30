var gutil = require('gulp-util');
var es = require('event-stream');

var merge = require('deepmerge');

var frontMatter = require('front-matter');

var collate = function(shared) {
  var config = shared.config;

  return es.map(function(file, cb) {
    var fm = file.frontMatter;

    /**
     * 'internals' variables are values for the SSG processor that don't get
     * pushed through to templates. These values can be set in config and
     * overridden in front matter:
     */

    var internals = file[config.ssg] = {};

    /**
     * 'page' variables are those for the page being processed and can only
     * come from front matter:
     */

    var page = (file.globals && file.globals.page) || {};

    if (fm) {
      config.front_matter.internals.map(function(variable) {
        var tmp = fm[variable] || config[variable];

        if (tmp) {
          internals[variable] = tmp;
        }
        delete fm[variable];
      });

      /**
       * copy 'page' variables from front matter. Note that we remove the
       * variables we know about so that anything left is a custom variable:
       */

      config.front_matter.page.map(function(variable) {
        if (fm[variable]) {
          page[variable] = fm[variable];
          delete fm[variable];
        }
      });

      /**
       * Merge in custom variable:
       */

      page = merge(page, fm);
    }

    /**
     * Finally set 'globals' to be an amalgam of 'site', 'page', 'content' and 'paginator':
     */

    file.globals = {
      site: shared.site,
      internals: internals,
      page: page,
      paginator: null
    };

    if (config.verbose) {
      gutil.log('  =>', file.globals.page);
    }
    cb(null, file);
  });
};

exports.collate = collate;
