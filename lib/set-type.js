/**
 * Indicate what type of document we're dealing with:
 */

var path = require('path');
var es = require('event-stream');

module.exports = function(config) {
  var paths = config.paths;
  var markdownExtensions = config.markdown_ext.split(',');

  return es.map(function(file, cb) {

    /**
     * If the document is in the posts or drafts folder then give it that type,
     * otherwise, if it's markdown or HTML then it's a page, otherwise it's a
     * static file:
     */

    file.type = 'static';

    /**
     * First split the file's path so that we can see what directory is being
     * referenced:
     */

    var pathObj = path.parse(file.path);

    /**
     * Also grab a version of the extension without the leading '.':
     */

    var extname = pathObj.ext.substring(1);

    /**
     * If the document is in the posts directory then it's a 'post':
     *
     * TODO: When we get to implementing collections then this could
     * be done by just setting 'posts' as a default type.
     */

    if (paths.posts === pathObj.dir) {
      file.type = 'posts';
    }

    /**
     * If the document is in the drafts directory then it's a 'draft':
     */

    else if (paths.drafts === pathObj.dir) {
      file.type = 'drafts';
    }

    /**
     * If the document is HTML or markdown then it's a page:
     */

    else if (markdownExtensions.indexOf(extname) !== -1) {
      file.type = 'pages';
    }
    cb(null, file);
  });
};
