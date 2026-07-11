// auto reload the page when stuff changes
(function startAutoReload() {
    const ws = new WebSocket("ws://localhost:8000/auto-reload");

    ws.addEventListener("message", (event) => {
        console.log("woah, got message, reloading");
        ws.close();
        location.reload();
    });

    ws.addEventListener("open", (event) => {
        console.log("yay, the ws is open");
    });

    ws.addEventListener("close", (event) => {
        console.log("aw man, the ws closed");
        setTimeout(startAutoReload, 5000);
    });

    ws.addEventListener("error", (event) => {
        console.log("wth, ws error:\n", event);
    });
})();
