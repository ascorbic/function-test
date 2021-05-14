// @ts-check
const createRequestObject = require("./createRequestObject");
const createResponseObject = require("./createResponseObject");

exports.handler = async function handler(event, context) {
  console.log({ event });
  const req = createRequestObject({ event, context });
  let handler;
  try {
    const manifest = require("../../../.cache/functions/manifest.json");
    console.log({ manifest, event });
  } catch (e) {
    return {
      statusCode: 404,
    };
  }

  return new Promise((onResEnd) => {
    const res = createResponseObject({ onResEnd });
  });
};
