const TextStyle = {
  GREEN: '\x1b[32m',
  RED: '\x1b[38;5;196m',
  YELLOW: '\x1b[33m',
  GRAY: '\x1b[90m',
  BOLD: '\x1b[1m',
  RESET: '\x1b[0m'
}

const redColor    = (item) => `${TextStyle.RED}${item}${TextStyle.RESET}`;
const yellowColor = (item) => `${TextStyle.YELLOW}${item}${TextStyle.RESET}`;
const greenColor  = (item) => `${TextStyle.GREEN}${item}${TextStyle.RESET}`;
const grayColor   = (item) => `${TextStyle.GRAY}${item}${TextStyle.RESET}`;
const textBold    = (item) => `${TextStyle.BOLD}${item}${TextStyle.RESET}`;

const CONSOLE_ICON = {
  ERROR: redColor('✖'),
  WARN: yellowColor('⚠'),
  INFO: greenColor('ⓘ')
}

const logMessageHelper = (icon = false, message = false, isNeedHelp = false, helpPath = false) => {
  const packName    = '[bvtrots-dx] ';
  const logIcon     = icon ? `${icon} ` : '';
  const logMessage  = message ? `${message} ` : '';
  const logHelper   = isNeedHelp ? 'Get help: ' : '';
  const logHelpPath = helpPath ? `file:///${helpPath} ` : '';


  return (packName + logIcon + logMessage + logHelper + logHelpPath);

}

module.exports = {
  redColor,
  yellowColor,
  greenColor,
  grayColor,
  textBold,
  CONSOLE_ICON,
  logMessageHelper
}
