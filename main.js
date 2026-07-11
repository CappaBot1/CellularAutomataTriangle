console.log("main.js is running at", new Date());
console.log(new Array(2**7).fill("-").join(""));

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const width  = canvas.width ;
const height = canvas.height;

ctx.fillStyle = "rgb(0 0 0)";
ctx.fillRect(0, 0, width, height);

console.log(`canvas initialised with dimensions: ${width}x${height}`);
