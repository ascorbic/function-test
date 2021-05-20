// @ts-check
const { builder } = require("@netlify/functions");
const { processFile } = require("gatsby-plugin-sharp/process-file");
const tempy = require("tempy");
const path = require("path");
const download = require("download");
const { readFileSync } = require("fs");

async function handler(event) {
  const [, , fileHash, queryHash, fileName] = event.path.split("/");
  console.log({ fileHash, queryHash, fileName });
  let imageData;
  try {
    imageData = require(`../../../.cache/caches/gatsby-runner/${fileHash}/${queryHash}.json`);
  } catch (e) {
    console.error(e);
    return {
      statusCode: 404,
      body: "Not found",
    };
  }

  const originalImageURL = `${
    process.env.DEPLOY_URL || `http://${event.headers.host}`
  }/static/${fileHash}/${imageData.originalImage}`;

  const tempdir = tempy.directory();

  await download(originalImageURL, tempdir);

  const outFile = path.join(tempdir, imageData.originalImage);

  let processed;

  const outputPath = path.join(
    tempdir,
    `${queryHash}.${imageData.args.toFormat}`
  );

  try {
    processed = await Promise.all(
      processFile(
        outFile,
        [
          {
            outputPath,
            args: imageData.args,
          },
        ],
        imageData.options
      )
    );
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": `image/${imageData.args.toFormat}`,
    },
    body: readFileSync(outputPath, "base64"),
    isBase64Encoded: true,
  };
}

exports.handler = builder(handler);
