#!/usr/bin/env node
const {run} = require('../src/cli');

run(process.argv.slice(2))
  .then(code => {
    process.exitCode = code;
  })
  .catch(error => {
    console.error('[kysaro]', error);
    process.exitCode = 2;
  });
