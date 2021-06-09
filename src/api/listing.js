import { readdirSync } from "fs";
import { dirname } from "path";
export default function handler(req, res) {
  let currentPath = __dirname;
  const data = [{ currentPath, dir: readdirSync(currentPath) }];
  while (currentPath !== "/") {
    currentPath = dirname(currentPath);
    data.push({ currentPath, dir: readdirSync(currentPath) });
  }
  res.status(200).json(data);
}
