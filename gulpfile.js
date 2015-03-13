var path = require('path');
var fs = require('fs');

var es = require('event-stream');
var yaml = require('js-yaml');

var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpIf = require('gulp-if');

var merge = require('deepmerge');
var frontMatter = require('./lib/front-matter');

/**
 * First load the Markheim configuration file:
 */

var config;

try {
  config = yaml.safeLoad(
    fs.readFileSync(path.join(__dirname, 'config', 'default.yml'), 'utf8')
  );
} catch (e) {
  new gutil.PluginError('Markheim', e);
}


/**
 * Now get the default Markheim configuration settings for this SSG:
 */

try {
  config = merge(
    config,
    yaml.safeLoad(
      fs.readFileSync(
        path.join(__dirname, 'config', config.ssg + '.yml'),
        'utf8'
      )
    )
  );
} catch (e) {
  new gutil.PluginError('Markheim', e);
}


/**
 * Now get the default SSG configuration settings. These are different from
 * the settings from the previous step, since they will be determined by the
 * SSG itself:
 */

try {
  config = merge(
    config,
    yaml.safeLoad(
      fs.readFileSync(
        path.join(__dirname, 'defaults', config.ssg + '.yaml'),
        'utf8'
      )
    )
  );
} catch (e) {
  new gutil.PluginError('Markheim', e);
}


/**
 * The root directory is the directory where the command is run, and all other
 * paths in the config are specified relative to that:
 */

var paths = {};

paths.root = process.cwd();


/**
 * Now we can get the user configuration settings:
 */

var userConfigFile = path.join(paths.root, config.config);

gutil.log('Configuration file:', userConfigFile);

try {
  config = merge(
    config,
    yaml.safeLoad(fs.readFileSync(userConfigFile, 'utf8'))
  );
} catch (e) {
  new gutil.PluginError('Markheim', e);
}

paths.source = path.join(paths.root, config.source);
paths.destination = path.join(paths.root, config.destination);
paths.plugins = path.join(paths.root, config.plugins);
paths.layouts = path.join(paths.root, config.layouts);
paths.includes = path.join(paths.root, './_includes');
paths.sass = path.join(paths.root, './_sass');
paths.posts = path.join(paths.root, './_posts');

gutil.log('            Source:', paths.source);
gutil.log('       Destination:', paths.destination);

/**
 * Set up the source descriptions with the source and any directories
 * to exclude:
 */

var src = [];

var include = config.include;
var exclude = config.exclude;

exclude.push(userConfigFile);
exclude.push(paths.plugins);
exclude.push(paths.layouts);
exclude.push(paths.includes);
exclude.push(paths.sass);
exclude.push(paths.posts);
exclude.push(paths.destination);

src.push(path.join(paths.source, '**', '*'));

include.map(function(directory) {
  src.push(directory);
  src.push(path.join(directory, '**', '*'));
});

exclude.map(function(directory) {
  src.push('!' + directory);
  src.push('!' + path.join(directory, '**', '*'));
});

/**
 * Similarly set up the 'clean' description with any directories to
 * exclude, i.e., to not delete:
 */

include = [path.join(paths.destination, '**', '*')];
exclude = [];

config.keep_files.map(function(file) {
    return path.join(paths.destination, file);
  })
  .map(function(directory) {
    exclude.push('!' + directory);
    exclude.push('!' + path.join(directory, '**', '*'));
  });

var clean = include.concat(exclude);


/**
 * Handy debug function:
 */

var logFileName = function(prefix) {
  return es.map(function (file, cb) {
    gutil.log('relative', prefix, ': ', file.relative);
    cb(null, file);
  });
};


/**
 * C L E A N
 * =========
 */

var del = require('del');

gulp.task('clean', function(cb) {
  return del(clean, cb);
});


/**
 * B U I L D
 * =========
 */

gulp.task('build', ['clean'], function() {
  gutil.log('      Generating...');

  return gulp.src(src)

    /**
     * The first step is to parse any front matter, since that determines
     * whether a file is simpy copied through, or gets processed:
     */

    .pipe(frontMatter.parse())
    .pipe(
      gulpIf(
        function(file) {
          return 'frontMatter' in file;
        },
        es.map(function(file, cb) {
          gutil.log('front matter found in', file.relative, '=>', file.frontMatter);
          cb(null, file);
        })
      )
    )
    .pipe(gulp.dest(paths.destination));
});
