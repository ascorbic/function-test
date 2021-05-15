const path = require("path");
const { copy, writeFile } = require("fs-extra");

exports.onPostBuild = async ({ store }) => {
  const root = store.getState().program.directory;

  // Copy compiled Gatsby functions into the Netlify function dir
  const compiledFunctionsDir = path.join(root, ".cache", "functions");
  const netlifyFunctionDir = path.join(
    root,
    "netlify",
    "functions",
    "gatsby",
    "functions"
  );
  await copy(compiledFunctionsDir, netlifyFunctionDir);

  // Add a splat rewrite for the /api/ route
  await writeFile(
    path.join(root, "public", "_redirects"),
    `/api/* /.netlify/functions/gatsby 200`
  );
};
