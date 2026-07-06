const { FIX_PRIORITY } = require('./const');


const sortFixes = (errors) => {
  return errors.sort((a, b) => {
    const aPriority = FIX_PRIORITY[a.fix.type] || 999;
    const bPriority = FIX_PRIORITY[b.fix.type] || 999;

    return aPriority - bPriority;
  });
}

module.exports = {
  sortFixes
}
