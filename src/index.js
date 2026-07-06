const {cli} = require('../bin/cli');
const {loadFile, LOAD_STRATEGY} = require("./lib/load-file");
const {getSettings} = require("./lib/pipeline/settings");

const raw = '' +
    '' +
    '    Chore (Auth): длинный заголовок коммита может не влезать в терминальное отображение, поэтому его длину рекоминдуют делать менее 72 символов\n' +
            'Тело коммита очень часто оказывается настолько длинным, что его приходится переносить на следующую строчку, что не всегда удобно.\n' +
            '     #Комментарий должен быть убран\n' +
            '     Короткие строки нормально влезают.\n' +
            'Однако, если вам приходится использовать длинные сообщения в теле коммита, моя программа автоматически распределит длинное предложение по строкам в соответствии с рекомендациями Конвенции Коммитов. Не беспокойтесь\n\n' +
            'note that we also updated the cache.\n' +
            'FOOTER-KEY: value \n' +
            '    fixes: если вам приходится использовать  сообщения  в теле коммита, моя программа автоматически распределит длинное предложение по строкам в соответствии с рекомендациями Конвенции Коммитов. Не беспокойтесь';

cli(raw);



// const commit = {
//     name: "commit",
//     file: {
//         name: 'commit.json',
//         defaultPath: './src/settings/commits',
//         userPath: './.3bvtrots-dx/settings/commits',
//     },
//     schema: {
//         name: 'commit.schema.json',
//         defaultPath: './src/settings',
//         userPath: null,
//     }
// }
//
//
// const config = {
//   DIRECTORY: {
//     USER: '.bvtrots-dx',
//     USER_SETTINGS: [ '.bvtrots-dx', 'settings' ],
//     COMMITS: 'commits',
//     SCHEMAS: 'schemas'
//   },
//   settingsDir: {
//     user: 'D:\\prog\\work\\projects\\bvtrots-dx\\bvtrots-developer-experience\\.bvtrots-dx\\settings',
//     default: 'D:\\prog\\work\\projects\\bvtrots-dx\\bvtrots-developer-experience\\src\\settings'
//   },
//   settingsGroups: { main: [ 'main' ], commits: [ 'commit', 'merge', 'request' ] },
//   reportDir: 'D:\\prog\\work\\projects\\bvtrots-dx\\bvtrots-developer-experience\\.bvtrots-dx'
// }






//
// // const res = loadFile('commit.json', configFilesPaths.default, './src/setting');
//
// const arra = [config];
// //
// const conf = getSettings(config);
// console.log(conf)

// console.log(loadFile(commit.file, LOAD_STRATEGY.USER_ONLY).issues)
