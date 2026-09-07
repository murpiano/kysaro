const chalk = require('chalk');
const _PACK_NAME = '[kysaro]';
const _LOGGER_ICON = {
  SUCCESS: chalk.green('✔'),
  ERROR: chalk.red('✖'),
  WARN: chalk.yellow('⚠'),
  INFO: chalk.green('ⓘ')
}


function logMessage(message) {
  console.log(_PACK_NAME, message);
}

function logWarn(message) {
  console.log(_PACK_NAME,_LOGGER_ICON.WARN, chalk.yellow(message));
}

function logError(message) {
  console.log(_PACK_NAME,_LOGGER_ICON.ERROR, chalk.red(message));
}

function logSuccess(message) {
  console.log(_PACK_NAME,_LOGGER_ICON.SUCCESS, chalk.green(message));
}


function logErrorTitle() {
  console.log(chalk.red.bold(`\n[${_PACK_NAME}] ✖ Commit message is invalid\n`));
}

function logErrorItem(err) {
  console.log(
    _LOGGER_ICON.ERROR,
    chalk.white(err.message),
    chalk.gray(`(${err.path.join('.')})`)
  );
}

function logMore(count) {
  console.log(chalk.gray(`...and ${count} more\n`));
}

function logFix(commit) {
  console.log(chalk.green('\nSuggested fix:\n'));
  console.log(chalk.white(commit));
}

function logDiff(changes) {
  if (!changes.length) return;

  console.log(chalk.green('\nChanges:\n'));

  changes.forEach(change => {
    console.log(
      chalk.gray(change.field.padEnd(20)),
      chalk.red(change.before),
      chalk.gray('→'),
      chalk.green(change.after)
    );
  });
}

function logQuestion() {
  process.stdout.write(
    chalk.yellow('\nApply fixes? (y/n): ')
  );
}

function logDetails(path) {
  if (!path) return;

  console.log(chalk.gray(`Details: ${path}`));
}


module.exports = {
  logMessage,
  logWarn,
  logError,
  logSuccess,
  logErrorTitle,
  logErrorItem,
  logMore,
  logFix,
  logDiff,
  logQuestion,
  logDetails
};
