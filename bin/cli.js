#!/usr/bin/env node
const {pipeline} = require("../src/lib/pipeline");


// const commitMsgFile = process.argv[2];
// if (!commitMsgFile) {
//   console.error('[kysaro] No commit message file provided');
//   process.exit(1);
// }
// const raw = fs.readFileSync(commitMsgFile, 'utf-8').trim();


const cliConfig = {
    maxErrorsToShow: 3,
    showDiff: true,
    openReport: false
};


const cli = (raw) => {
    const result = pipeline(raw)
console.log('result: ', result)

//     const reportPath = generateReport({
//         raw,
//         fixed: result.commit,
//         errors: result.initialErrors,
//         appliedFixes: result.appliedFixes,
//         originalAst: originalAst.ast,
//         finalAst: result.ast,
//         reportType: 'Standard Commit'
//     });
// console.log(reportPath)
    // console.log('result.appliedFixes', result.appliedFixes)

    // if (result.isValid) {
    //     process.exit(0);
    // }

    // console.log('result.initialErrors', result.initialErrors)
    // console.log('result.appliedFixes', result.appliedFixes)
    //
    //
    //   console.log('originalAst: originalAst.ast,', originalAst.ast,)
    //   console.log('finalAst: result.ast',  result.ast)
    // logErrorTitle();
    //
    // const errorsToShow = result.initialErrors.slice(0, cliConfig.maxErrorsToShow);
    //
    // errorsToShow.forEach(logErrorItem);
    //
    // if (result.initialErrors.length > cliConfig.maxErrorsToShow) {
    //     logMore(result.initialErrors.length - cliConfig.maxErrorsToShow);
    // }
    //
    // logDetails(reportPath);
    //
    // logFix(result.commit);
    //
    // if (cliConfig.showDiff) {
    //     const changes = buildSmartDiff(
    //         result.appliedFixes,
    //         originalAst.ast,
    //         result.ast
    //     );
    //
    //     logDiff(changes);
    // }


// let reportPath = null;
// if (cliConfig.openReport) {
//   reportPath = generateReport(...)
//   logHelp(reportPath)
// }


    // (async () => {
    //   logQuestion();
    //
    //
    //   const answer = await ask('Apply fixes? (y/n): ');
    //
    //
    //   if (answer === 'y') {
    //     console.log('применили')
    //     console.log(result)
    //     // fs.writeFileSync(commitMsgFile, result.commit);
    //     process.exit(0);
    //   }
    //   console.log('отменили')
    //   process.exit(1);
    // })();


}

module.exports = {cli}
