/**
 * Indicate what type of document we're dealing with:
 */

var path = require('path');
var es = require('event-stream');

module.exports = function(config) {
  var paths = config.paths;

  return es.map(function(file, cb) {

    /**
     * If the document is in the posts or drafts folder then give it that type,
     * otherwise it's a page:
     */

    file.type = 'pages';

    /**
     * First split the file's path:
     */

    var pathObj = path.parse(file.path);

    /**
     * If the document is in the posts directory then it's a 'post':
     */

    if (paths.posts === pathObj.dir) {
      file.type = 'posts';
    }

    /**
     * If the document is in the posts directory then it's a 'post':
     */

    else if (paths.drafts === pathObj.dir) {
      file.type = 'drafts';
    }
    cb(null, file);
  });
};
