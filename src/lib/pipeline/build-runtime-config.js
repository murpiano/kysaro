// const {
//   COMMIT_TYPE
// } = require("../../all/const/const");
//
//
// function resolveCommitSettings(
//   commitsSettings,
//   commitType
// ) {
//
//   const commits =
//     Object.keys(COMMIT_TYPE);
//
//   for (const commitName of commits) {
//
//     const lower =
//       commitName.toLowerCase();
//
//     if (
//       COMMIT_TYPE[commitName] ===
//       commitType
//     ) {
//
//       return (
//         commitsSettings?.[lower] ||
//         {}
//       );
//     }
//   }
//
//   return {};
// }
//
//
// function buildRuntimeConfig(
//   settings,
//   commitType
// ) {
//
//   return {
//
//     ...(settings.main || {}),
//
//     commitSettings:
//       resolveCommitSettings(
//         settings.commits,
//         commitType
//       )
//   };
// }
//
//
// module.exports = {
//   buildRuntimeConfig
// };
