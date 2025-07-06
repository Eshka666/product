import { createServer } from "http";
import { handler } from "./dist/server/entry.ssr.js";

const port = process.env.PORT || 3000;

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const evt = { request: req, url };
  const response = await handler(evt);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
}).listen(port, () => console.log(`Listening on ${port}`));
