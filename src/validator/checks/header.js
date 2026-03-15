module.exports = (parsed, conf, settings) => {
  const header = parsed.header || '';
  const isMergeType = parsed.type === 'merge';
  const hasHashtag = /#\d+$/.test(header);

  if (header.length > conf.headerMaxLength) {
    return [false, `Header too long (${header.length}/${conf.headerMaxLength})` ];
  }
  if (header.length < conf.headerMinLength) {
    return [false, `Header too short (${header.length}/${conf.headerMinLength})` ];
  }

  if (isMergeType && hasHashtag && settings.merge_commit.requireHashtagWithNumber && !hasHashtag) {
    return [false, 'Merge commit must end with #PRNumber'];
  }

  return [true];
};
