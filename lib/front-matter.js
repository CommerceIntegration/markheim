var es = require('event-stream');

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

exports.parse = parse;
