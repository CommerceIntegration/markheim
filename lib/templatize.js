var path = require('path');
var es = require('event-stream');

var gutil = require('gulp-util');

var _ = require('lodash');

module.exports = function(shared) {
  var config = shared.config;
  var site = shared.site;
  var paths = config.paths;

  return es.map(function(file, cb) {
    var page = file.page;

    if (!page) {
      return cb(null, file);
    }

    var fm = file.frontMatter;
    var layout = fm && fm.layout;
    var adapter = require('adapter-template');
    var engineName = config.template.language;
    var engine = adapter(engineName);

    engine.filters = config.template.filters || config.ssg;

    if (config.verbose) {
      gutil.log('Template engine set to:', engineName);
      gutil.log('Filters set to:', engine.filters);
    }

    var locals = {
      site: _.merge(config, site),
      page: file.page,
      content: String(file.contents),
      paginator: null
    };

    /**
     * Move this to the page-setting stage?:
     */

    if (file.excerpt) {
      locals.page.excerpt = file.excerpt;
    }

    /**
     * This doesn't seem right...need to check where it's used:
     */

    locals.post = _.cloneDeep(file.page);

    var params = {
      locals: locals,
      includeDir: paths.includes
    };

    var _cb = function (err, html){
      if (err){
        return cb(err);
      }
      file.contents = new Buffer(html);
      cb(null, file);
    };

    if (layout) {
      engine.renderFile(path.join(paths.layouts, layout + '.html'), params, _cb);
    } else {
      engine.render(String(file.contents), params, _cb);
    }
  });
};
