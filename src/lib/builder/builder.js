const buildHeader = (headerAst) => {
  const {type, scope, breaking, subject} = headerAst;
  const scopePart = scope === null || scope === undefined ? '' : `(${scope})`;
  const breakingPart = breaking ? '!' : '';

  return `${type}${scopePart}${breakingPart}: ${subject}`;
};

const buildFooterToken = (token) => `${token.key}${token.separator || ': '}${token.value}`;

const buildMessage = (ast) => {
  const parts = [];

  // header
  parts.push(buildHeader(ast.header));

  // body
  if (ast.body?.lines?.length > 0) {
    parts.push('');
    parts.push(ast.body.lines.join('\n'));
  }

  // footer
  if (ast.footer?.tokens?.length > 0) {
    parts.push('');
    parts.push(ast.footer.tokens.map(buildFooterToken).join('\n'));
  }

  return parts.join('\n');
};

module.exports = {buildHeader, buildFooterToken, buildMessage};
