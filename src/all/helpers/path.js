const path = require('path');
const fs = require("fs");

function getNearestExistingPath(targetPath) {
  if (!targetPath) return process.cwd();

  let current = path.resolve(targetPath);

  while (current !== path.dirname(current)) {
    if (fs.existsSync(current)) {
      return current;
    }
    current = path.dirname(current);
  }

  return process.cwd();
}


function resolveRelativePath(reportPath, targetPath) {
  const existingPath = getNearestExistingPath(targetPath);
  const relative = path.relative(path.dirname(reportPath), existingPath);

  return (relative.startsWith('.')
    ? relative
    : `./${relative}`)
  .replace(/\\/g, '/');
}


function resolvePath(reportPath, basePath, fileName) {

  if (!basePath || !fileName) {
    return null;
  }

  return resolveRelativePath(reportPath, path.join(basePath, fileName));
}


function formatDisplayPath(fullPath) {

  if (!fullPath) {
    return '';
  }

  const relative = path.relative(process.cwd(), fullPath);

  return `./${relative.replace(/\\/g, '/')}`;
}


function formatCliPath(fullPath) {
  return `file:///${fullPath}`;
}


function joinIfExists(...parts) {

  return path.join(
    ...parts.filter(Boolean)
  );
}


function normalizeInstancePath(instancePath, extra = null) {
  const base = instancePath?.split('/')
  .filter(Boolean)
  .join('.');

  if (!extra) {
    return base || 'root';
  }

  return base
    ? `${base}.${extra}`
    : extra;
};


module.exports = {
  getNearestExistingPath,
  resolveRelativePath,
  resolvePath,
  formatDisplayPath,
  formatCliPath,
  joinIfExists,
  normalizeInstancePath
}
