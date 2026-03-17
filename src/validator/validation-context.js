const loadConfig = require("../lib/loader");

const { types: typesData, scopes: scopesData, settings } = loadConfig();

const emojiMap = Object.fromEntries(Object.entries(typesData).map(([key, val]) => [key, val.emoji]));
const scopesMap = Object.keys(scopesData);
const emojiPattern = Object.values(emojiMap).join('|');

module.exports = { typesData, scopesData, settings, emojiMap, emojiPattern, scopesMap };
