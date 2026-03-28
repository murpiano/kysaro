const {resolve} = require("path");
const tjs       = require("typescript-json-schema");
const fs        = require("fs");


const compilerOptions = {
  strictNullChecks: true,
};


const tasks = [
  ["../src/settings/settings.d.ts", "StandardConfig", "commit"],
  ["../src/settings/settings.d.ts", "MergeConfig", "merge"],
  ["../src/settings/settings.d.ts", "RequestConfig", "request"],
  ["../src/settings/settings.d.ts", "TypesConfig", "types"],
  ["../src/settings/settings.d.ts", "ScopesConfig", "scopes"],
  ["../src/settings/settings.d.ts", "TokensConfig", "tokens"],
];

const settings = {
  required: true,
  noExtraProps: true,
};


tasks.forEach(([source, typeName, fileName]) => {
  const program = tjs.getProgramFromFiles([resolve(__dirname, source)], compilerOptions);
  const schema  = tjs.generateSchema(program, typeName, settings);

  if (schema) {
    const outPath = resolve(__dirname, `../src/settings`, `${fileName}.schema.json`);
    fs.writeFileSync(outPath, JSON.stringify(schema, null, 2));
    console.log(`✅ Schema ${typeName} have been created successful: ${fileName}.schema.json`);
  } else {
    console.error(`❌ Schema ${typeName} generation error`);
  }
});
