const path = require("path");
const { copy } = require("fs-extra");

exports.onPostBuild = async ({ store }) => {
  const root = store.getState().program.directory;
  const compiledFunctionsDir = path.join(root, ".cache", "functions");
  const netlifyFunctionDir = path.join(
    root,
    "netlify",
    "functions",
    "gatsby",
    "functions"
  );

  await copy(compiledFunctionsDir, netlifyFunctionDir);
};
