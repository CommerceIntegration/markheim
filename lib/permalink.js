var path = require('path');
var es = require('event-stream');

var gutil = require('gulp-util');

var _ = require('lodash');
var urlTemplate = require('url-template');

module.exports = function(config) {
  return es.map(function(file, cb) {
    var fm = file.frontMatter;

    if (fm) {
      var permalink = fm.permalink || config.permalink;

      if (file.type === 'posts' || (file.type === 'pages' && permalink[0] === '/')) {

        /**
         * If the permalink value begins with a slash then we use it as a template,
         * otherwise it's the name of a template and so we need to do a lookup:
         */

        var template;

        if (permalink[0] === '/' || file.type === 'pages') {
          template = permalink;
        } else {
          template = config.permalink_templates[permalink];
        }

        if (config.verbose) {
          gutil.log('  template:', template);
        }

        /**
         * We can cope with proper RFC 6570 format, or the colon prefixed format
         * used by Jekyll:
         */

        template = template
          .replace(/\:(\w*)/g, '{$1}')
          .replace(/\{categories\}/g, '{/categories*}');

        /**
         * Next work out the parameters that will be passed to the template. If
         * we have a post then the values will come from the post's file system
         * path:
         */

        var params = {};

        if (file.type === 'posts') {

          /**
           * If we have a post then get the date and title information from the
           * post name:
           */

          var match = file.relative.match(new RegExp(config.post_name_format));

          if (match){
            params = {
              year: match[1],
              month: match[2],
              i_month: Number(match[2]),
              day: match[3],
              i_day: Number(match[3]),
              short_year: match[1].substr(2),
              title: file.page.slug || match[4],
              categories: file.page.categories
            };
          }
        }

        var url = urlTemplate
          .parse(template)
          .expand(params);

        /**
         * The templating step converts spaces to '%20' which seems to cause
         * problems in browsers, so for now, workaround this:
         */

        url = url.replace(/%20/g, '+');

        /**
         * Finally, remove any duplicated slashes and save the values:
         */

        url = url.replace('//', '/');
        if (config.verbose) {
          gutil.log('  url:', url);
        }
        file.page = file.page || {};
        file.page.url = url;
        file.path = './' + url;
      }
    }
    cb(null, file);
  });
};
