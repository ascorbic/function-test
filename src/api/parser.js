export default function topLevel(req, res) {
  if (req.query) {
    res.json(req.query);
  } else if (req.body) {
    res.json(req.body);
  } else {
    res.json({ nobody: `no body was sent`, req });
  }
}
