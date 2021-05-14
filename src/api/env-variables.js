export default function topLevel(req, res) {
  res.json(process.env.pickle);
}
