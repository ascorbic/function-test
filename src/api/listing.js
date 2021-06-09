import { readDirSync } from "fs";
import { dirname } from "path";
export default function handler(req, res) {
  let currentPath = __dirname;
  const data = [{ currentPath, dir: readDirSync(currentPath) }];
  while (currentPath !== "/") {
    currentPath = dirname(currentPath);
    data.push({ currentPath, dir: readDirSync(currentPath) });
  }
  res.status(200).json(data);
}
