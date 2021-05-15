const path = require("path");
const { copy, writeFile } = require("fs-extra");

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
  await writeFile(
    path.join(root, "public", "_redirects"),
    `/api/* /.netlify/functions/gatsby 200`
  );
};
