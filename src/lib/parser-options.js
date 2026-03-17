module.exports = {
  headerCorrespondence: ['emoji', 'type', 'scope', 'subject', 'ticket'],
  createHeaderPattern: (emojiPattern) => {

    return new RegExp(`^(${emojiPattern})\x20(\\w+)\x20\\((.*)\\):\x20(.*?)(?:\x20(#\\d+))?$`, 'u');
  }
};
