const path = require('path');
const fs = require('fs');

const mdRed = (item) =>
  `<span style="color:#ff0000"><b>${item}</b></span>`;

const getBasePath = ({ userUsed, userPath, defaultPath }) =>
  userUsed && userPath ? userPath : defaultPath;

const getRelativePath = (from, to) => {
  if (!to) return null;
  let rel = path.relative(path.dirname(from), to).replace(/\\/g, '/');
  return rel.replace(/ /g, '%20');
};

const resolvePath = (reportPath, basePath, fileName) => {
  const fullPath = path.join(basePath, fileName);
  let rel = getRelativePath(reportPath, fullPath);

  if (!fs.existsSync(fullPath)) {
    rel = rel?.replace(`/${fileName}`, '');
  }

  return rel;
};


const formatDisplayPath = (fullPath) => {
  if (!fullPath) return '';
  const rel = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
  return `./${rel}`;
};


const linkedIcon = (icon, path) =>
  path ? `[${icon}](${path.trim()})` : icon;

const hasAnyIssues = (settings, keys) =>
  keys.some(
    (key) =>
      settings[key]?.errors?.length > 0 ||
      settings[key]?.warnings?.length > 0
  );

const isUserConfigUsed = (config) =>
  config?.info?.some(m => m.includes('User settings are used'));

const isDefaultConfigUsed = (config) =>
  config?.info?.some(m => m.includes('Default settings are used'));

const buildTableHeader = (keys, coloredKeys) =>
  `| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Source&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | ${coloredKeys.join(' | ')} |\n` +
  `| :--- | ${keys.map(() => ':---:').join(' | ')} |\n`;


module.exports = {
  mdRed,
  resolvePath,
  linkedIcon,
  hasAnyIssues,
  isUserConfigUsed,
  isDefaultConfigUsed,
  buildTableHeader,
  getBasePath,
  formatDisplayPath
};
