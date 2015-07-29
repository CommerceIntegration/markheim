#!/usr/bin/env node
//node_modules/markheim/node_modules/.bin/gulp --gulpfile node_modules/markheim/gulpfile.js --cwd . clean

var Liftoff = require('liftoff');
var argv = require('minimist')(process.argv.slice(2));

var Markheim = new Liftoff({
  processTitle: 'markheim',
  moduleName: 'gulp',
  configName: 'gulp',
  extensions: require('interpret').jsVariants
}).on('require', function (name, module) {
  console.log('Loading:', name);
}).on('requireFail', function (name, err) {
  console.log('Unable to load:', name, err);
});

argv.gulpfile = 'node_modules/markheim/gulpfile.js';
argv.cwd = '.';
var tasks = argv._;
var toRun = tasks.length ? tasks : ['default'];

Markheim.launch({
  cwd: argv.cwd,
  configPath: argv.gulpfile,
  require: argv.require,
  completion: argv.completion,
  verbose: argv.verbose
}, invoke);

function invoke (env) {
  if(env.configPath) {
    require(env.configPath);

    var gulpInst = require(env.modulePath);

    process.nextTick(function() {
      gulpInst.start.apply(gulpInst, toRun);
    });
  } else {
    console.log('No Markheim gulpfile found.');
  }
}
