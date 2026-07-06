
const buildHeader = (headerAst) => {
  const { type, scope, subject } = headerAst;

  return scope
    ? `${type}(${scope}): ${subject}`
    : `${type}: ${subject}`;
};

const buildMessage = (ast) => {
// console.log(ast)
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
    parts.push(
      ast.footer.tokens
      .map((t) => `${t.key}: ${t.value}`)
          .join('\n')
    );
  }

  return parts.join('\n');
};

module.exports = { buildHeader, buildMessage };
