#!/usr/bin/env node
'use strict';

/**
 * Act as if the command has been run like this (in the blog directory):
 *
 *  node_modules/markheim/node_modules/.bin/gulp \
 *    --gulpfile node_modules/markheim/gulpfile.js \
 *    --cwd . \
 *    clean
 */

let spawn = require('child_process').spawn;

spawn(
  'node_modules/.bin/gulp',
  [
    '--gulpfile', 'node_modules/markheim/gulpfile.js',
    '--cwd', '.',
    ...process.argv.slice(2)
  ],
  {stdio: 'inherit'}
);
