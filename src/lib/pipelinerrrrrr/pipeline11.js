const defaultConfig   = require('../../config');
const {parseMessage}  = require('../parser');
const {loadConfig}    = require('../pipeline/settings');
const {createContext} = require('../validator');
const {validate}      = require('./validate');
const {fix}           = require('./fix');




module.exports = {pipeline11};
