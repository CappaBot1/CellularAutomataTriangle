import { serveDir } from "@std/http/file-server";
import * as path from "@std/path";

const servePaths = [
    "", // this is just / which goes to index.html
    //"index.html",
    "main.css",
    "main.js",
].map(x => path.join("/", x));

Deno.serve((req) => {
    const url = new URL(req.url);
    const pathname = url.pathname;
    //console.log(pathname);

    if (servePaths.includes(pathname)) {
        return serveDir(req, { fsRoot: "./" });
    }

    return new Response("404", { status: 404 });
});
