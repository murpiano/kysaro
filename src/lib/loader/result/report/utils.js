const {resolveRelativePath} = require("../../../../all/helpers/path");

function _normalizeRecommendations(recommendations) {
  return recommendations
    ? `<br><sub>💡 ${recommendations}</sub>`
    : '';
}

function _mdRed(item) {
  return `<span style="color:#ff0000"><b>${item}</b></span>`;
}

function _linkedIcon(icon, targetPath) {
  return targetPath ?
    `[${icon}](${targetPath.trim()})`
    :
    icon;
}

function _buildFileLink(reportPath, targetPath, label) {

  if (!targetPath) {
    return label;
  }

  const relative = resolveRelativePath(reportPath, targetPath);

  return `[${label}](${relative})`;
}

function _formatInternalPath(path) {
  return path ? path : '';
}


/**
 * @description - пробелы сделаны чтобы визаульно все таблицы были одного размера
 * @param {string[]} coloredKeys
 * @return {string}
 */
function _buildTableHeader(names,coloredKeys) {
  return `| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Source&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | ${coloredKeys.join(' | ')} |\n` +
    `| :--- | ${coloredKeys.map(() => ':---:').join(' | ')} |\n`;
}



function _createTableHeader(names, entity) {

  const coloredKeys =
    names.map(key => {

      const result =
        entity?.[key];

      return result?.ok
        ? key
        : _mdRed(key);

    });

  return _buildTableHeader(
    names,
    coloredKeys
  );

}


function _createReport(title, names, entity, tableBody) {

  const sectionTitle =
    `### ${title}`;

  const tableHeader =
    _createTableHeader(names, entity);

  const {
    row,
    diagnosticDetails
  } = tableBody;


  return (
    `${sectionTitle}\n\n` +
    `${tableHeader}` +
    `${row}\n` +
    (
      diagnosticDetails
        ? `\n${diagnosticDetails}`
        : ''
    ) +
    `\n________________________________\n`
  );

}

function _formatOriginalError( error){

  if (!error?.message) {
    return '';
  }

  const message = error.message;

  if (message.includes('ENOENT')) {
    return ' (Error: ENOENT)';
  }

  const syntaxMatch = message.match(
      /at position \d+(\s+\(line \d+ column \d+\))?/i
    );

  if (error.name === 'SyntaxError') {

    return syntaxMatch
      ? ` (${error.name}: ${syntaxMatch[0]})`
      : ` (${error.name})`;
  }

  return ` (${error.name || 'Error'})`;
}

function _createArgsBlock(issue){
  return Array.isArray(issue.meta?.args) &&
  issue.meta.args.length > 0
    ? ` ${issue.meta.args
    .map(arg =>
      `<span style="color:#589df6">${String(arg).replace(/^'|'$/g, '')}</span>`
    )
    .join(', ')}`
    : '';
}

function _createInfoBlock(issue, args){
  return issue.meta?.info
    ? `<br><sup style="color: #888;"> &nbsp; &nbsp; &nbsp; &nbsp; ${issue.meta.info} ${args}</sup>`
    : '';
}


module.exports = {
  _normalizeRecommendations,
  _linkedIcon,
  _buildFileLink,
  _formatInternalPath,
  _createReport,
  _createTableHeader,
  _formatOriginalError,
  _createArgsBlock,
  _createInfoBlock
}
