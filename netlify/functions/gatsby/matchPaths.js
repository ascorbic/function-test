// @ts-check

const pathToRegexp = require("path-to-regexp");

module.exports = async (req, res, next, functions) => {
  const { 0: pathFragment } = req.params;

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
    const pathToFunction = functionObj.absoluteCompiledFilePath;

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
    next();
  }
};
