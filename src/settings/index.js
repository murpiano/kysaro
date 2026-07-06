const APP_SETTINGS = ['main'];
const COMMIT_TYPES = ['commit', 'merge', 'request'];


module.exports = {
  filesGroups: {
    main: APP_SETTINGS,
    commits: COMMIT_TYPES,
  },
  dir: __dirname
};
