/**
 * @file Utility helpers for report generation.
 *
 * @description
 * Provides low-level helper functions used by report generators.
 *
 * Responsibilities:
 * - markdown formatting (colors, icons, tables)
 * - filesystem-aware path resolution (relative links)
 * - configuration state detection (user/default usage, issues)
 *
 * These helpers are intentionally simple and composable.
 * They do NOT contain business logic — only formatting and small utilities.
 *
 * @usedBy
 * - settings report
 * - validators report
 * - validation report
 */

const path = require('path');
const fs = require('fs');

// Highlight text in red for markdown (used to mark problematic keys)
const mdRed = (item) =>
  `<span style="color:#ff0000"><b>${item}</b></span>`;


// Resolve base path depending on config source (user or default)
const getBasePath = ({ userUsed, userPath, defaultPath }) =>
  userUsed && userPath ? userPath : defaultPath;

// Build relative path from report file to target file (URL-safe)
const getRelativePath = (from, to) => {
  if (!to) return null;
  const projectRoot = process.cwd();
  let rel = path.relative(projectRoot, to).replace(/\\/g, '/');

  if (!rel.startsWith('.') && !rel.startsWith('/')) {
    rel = './' + rel;
  }

  return rel.replace(/ /g, '%20');
};


// Resolve path for report links, fallback if file does not exist
const resolvePath = (reportPath, basePath, fileName) => {
  const fullPath = path.join(basePath, fileName);
  let rel = getRelativePath(reportPath, fullPath);

  if (!fs.existsSync(fullPath)) {
    rel = rel?.replace(`/${fileName}`, '');
  }

  return rel;
};


// Format absolute path into readable relative path for display
const formatDisplayPath = (fullPath) => {
  if (!fullPath) return '';
  const rel = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
  return `./${rel}`;
};


// Wrap icon into markdown link if path exists
// If path is missing → returns plain icon (no link)
const linkedIcon = (icon, path) =>
  path ? `[${icon}](${path.trim()})` : icon;


// Check if any config contains errors or warnings
const hasAnyIssues = (settings, keys) =>
  keys.some(
    (key) =>
      settings[key]?.errors?.length > 0 ||
      settings[key]?.warnings?.length > 0
  );


// Detect whether user config was used
const isUserConfigUsed = (config) =>
  config?.info?.some(m => m.includes('User settings are used'));


// Detect whether default config fallback was used
const isDefaultConfigUsed = (config) =>
  config?.info?.some(m => m.includes('Default settings are used'));


// Build markdown table header for report
//
// NOTE:
// "&nbsp;" is intentionally hardcoded to visually align tables across sections.
// This ensures consistent column width with the longest label
// (e.g. "Schema + Ajv.compile" in validators section).
//
// This is a presentation-layer hack and acceptable here,
// since markdown tables do not support column width control.
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
