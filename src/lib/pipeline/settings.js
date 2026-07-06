const {runLoader} = require('../loader');
const {COMMIT_TYPE} = require('../../all/const/const');

function getCurrentCommitSettings(commitsSettings, commitType) {
  const commitKey = Object.keys(COMMIT_TYPE).find(key => COMMIT_TYPE[key] === commitType).toLowerCase()

  if (!commitKey) {
    return {};
  }

  return commitsSettings?.[commitKey] || {}
}


function getSettings(configuration, commitType) {
  const loaded = runLoader(configuration);




  // console.log('LOADED.SETTINGS.COMMITS' , loaded.settings.commits, '\n_________________________________________________________\n')
  // console.log('LOADED.REPORTS.GROUPS.COMMITS' , loaded.reports.groups.commits, '\n_________________________________________________________\n')
  // console.log('LOADED.REPORTS.ISSUES' , loaded.reports.issues, '\n_________________________________________________________\n')



  if (!loaded.ok) {
    return null;
  }

  return {
    main: loaded?.settings?.main?.main || {},
    commitSettings: getCurrentCommitSettings(loaded?.settings?.commits, commitType)
  };
}


module.exports = {
  getSettings
};
