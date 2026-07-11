import { serveDir } from "@std/http/file-server";
import * as path from "@std/path";

const servePaths = [
    "", // this is just / which goes to index.html
    //"index.html",
    "main.css",
    "main.js",
    "auto-reload.js",
].map((x) => path.join("/", x));

const clientSockets: WebSocket[] = [];

Deno.serve((req) => {
    const url = new URL(req.url);
    const pathname = url.pathname;

    if (pathname == "/auto-reload") {
        const { socket, response } = Deno.upgradeWebSocket(req);

        socket.addEventListener("open", (_event) => {
            console.log("client has connected");
        });

        clientSockets.push(socket);
        return response;
    }

    if (servePaths.includes(pathname)) {
        return serveDir(req, { fsRoot: "./" });
    }

    return new Response("404", { status: 404 });
});

// auto reload the client when stuff changes
const absoluteServePaths = servePaths // modify the servePaths a bit
    .toSpliced(servePaths.indexOf("/"), 1, "/index.html") // replace / with /index.html for file watching purposes
    .map((x) => path.join(Deno.cwd(), x)); // join that path with the current path

const watcher = Deno.watchFs("."); // start watching the current directory

for await (const event of watcher) { // check all events of the watcher
    if (clientSockets.length == 0) continue; // make sure a client is connected
    if (event.kind != "modify") continue; // make sure something actually changed

    for (const path of event.paths) {
        if (!absoluteServePaths.includes(path)) continue; // make sure it's a path we care about

        for (const socket of clientSockets) { // loop over all of the clients
            socket.send("yo, reload the page"); // and tell them to reload
        }
    }
}
