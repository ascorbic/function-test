export default function topLevel(req, res) {
  if (req.query && Object.keys(req.query).length) {
    res.json(req.query);
  } else if (req.body) {
    res.json(req.body);
  } else {
    res.json({ nobody: `no body was sent`, req });
  }
}
