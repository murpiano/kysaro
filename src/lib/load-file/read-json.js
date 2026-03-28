const fs = require('fs');
const {
        FileNotFoundError,
        EmptyFileError,
        EmptyObjectError,
        JsonParseError
      }  = require('./errors');

module.exports = (filePath, file, {isCritical = false, errors, warnings}) => {
  if (!filePath) return null;

  try {
    if (!fs.existsSync(filePath)) {
      const err = new FileNotFoundError(file, filePath, isCritical);
      isCritical ? errors.push(err) : warnings.push(err);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf8').trim();

    if (!content) {
      const err = new EmptyFileError(file, filePath, isCritical);
      isCritical ? errors.push(err) : warnings.push(err);
      return null;
    }

    const data = JSON.parse(content);

    if (Object.keys(data).length === 0) {
      const err = new EmptyObjectError(filePath, isCritical);
      isCritical ? errors.push(err) : warnings.push(err);
    }

    return data;

  } catch (e) {
    const err = new JsonParseError(filePath, e, isCritical);
    errors.push(err);
    return null;
  }
}
