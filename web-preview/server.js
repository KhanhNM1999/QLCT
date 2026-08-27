const http = require("http")
const fs = require("fs")
const path = require("path")

const port = Number(process.env.QLCT_PREVIEW_PORT || 5173)
const root = __dirname

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml"
}

const server = http.createServer((req, res) => {
  const requestedPath = decodeURIComponent(req.url.split("?")[0])
  const filePath = path.join(root, requestedPath === "/" ? "index.html" : requestedPath)

  if (!filePath.startsWith(root)) {
    res.writeHead(403)
    res.end("Forbidden")
    return
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404)
      res.end("Not found")
      return
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    })
    res.end(data)
  })
})

server.listen(port, () => {
  console.log(`QLCT preview running at http://localhost:${port}`)
})
