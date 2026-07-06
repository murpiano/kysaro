const FIX_PRIORITY = {
  trim: 1,

  replace: 2,
  remove: 2,
  insert: 2,

  lowercase: 3,
  uppercase: 3,
  sentenceCase: 3,

  slice: 4,
  wrap: 5
};

const ITERATION_SAFE_LIMIT = 5;

module.exports = {
  FIX_PRIORITY,
  ITERATION_SAFE_LIMIT
}
