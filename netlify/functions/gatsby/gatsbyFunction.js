// @ts-check

const pathToRegexp = require("path-to-regexp");
const bodyParser = require("co-body");
const multer = require("multer");
const parseForm = multer().none();
const path = require("path");

module.exports = async (req, res, functions) => {
  console.log(req);

  await new Promise((next) => parseForm(req, res, next));
  try {
    if (!req.body) {
      req.body = await bodyParser(req);
    }
  } catch (e) {}

  const pathFragment = decodeURIComponent(req.url.substr(5));
  console.log({ pathFragment });

  // Check first for exact matches.
  let functionObj = functions.find(({ apiRoute }) => apiRoute === pathFragment);

  if (!functionObj) {
    // Check if there's any matchPaths that match.
    // We loop until we find the first match.
    functions.some((f) => {
      let exp;
      const keys = [];
      if (f.matchPath) {
        exp = pathToRegexp(f.matchPath, keys);
      }
      if (exp && exp.exec(pathFragment) !== null) {
        functionObj = f;
        const matches = [...pathFragment.match(exp)].slice(1);
        const newParams = {};
        matches.forEach(
          (match, index) => (newParams[keys[index].name] = match)
        );
        req.params = newParams;

        return true;
      } else {
        return false;
      }
    });
  }

  if (functionObj) {
    console.log(`Running ${functionObj.apiRoute}`);
    const start = Date.now();
    const pathToFunction =
      process.env.NETLIFY_DEV === "true"
        ? functionObj.absoluteCompiledFilePath
        : path.join(
            __dirname,
            "functions",
            functionObj.relativeCompiledFilePath
          );

    try {
      delete require.cache[require.resolve(pathToFunction)];
      const fn = require(pathToFunction);

      const fnToExecute = (fn && fn.default) || fn;

      await Promise.resolve(fnToExecute(req, res));
    } catch (e) {
      console.error(e);
      // Don't send the error if that would cause another error.
      if (!res.headersSent) {
        res
          .status(500)
          .send(
            `Error when executing function "${functionObj.originalFilePath}": "${e.message}"`
          );
      }
    }

    const end = Date.now();
    console.log(
      `Executed function "/api/${functionObj.apiRoute}" in ${end - start}ms`
    );
  } else {
    res.status(404).send("Not found");
  }
};