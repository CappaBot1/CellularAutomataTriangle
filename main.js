console.log("main.js is running at", new Date());
console.log(new Array(2 ** 7).fill("-").join(""));

const downloadButton = document.getElementById("download-button");

const canvas = document.getElementById("canvas");

const size = 2000;

const width  = size;
const height = size;

canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext("2d", {
    willReadFrequently: true // reading frequently to get the pixel data to compute the stuff and things
});

console.log(`canvas dimensions: ${width}x${height}`);

const colours = [
    "rgba(0, 0, 0, 1)", // background
    "rgba(255, 0, 0, 1)", // colour 1
    "rgba(0, 255, 0, 1)", // colour 2
    "rgba(0, 0, 255, 1)", // colour 3
];

const coloursData = colours.map((colour) =>
    colour
        .replace("rgba(", "")
        .replace(")", "")
        .split(", ")
        .map(Number)
        .map((x, i) => i === 3 ? x * 255 : x) // change the alpha range from 0-1 to 0-255
);

const dataMapColour = new Map();

coloursData.forEach((colour, index) => {
    dataMapColour.set(colour.join(","), index);
});

const id = 213321; // this is where you put the id for the stuff and things!!!
// ^ 213321 is the best id according to the guy that invented this thing
// get id's from these videos:
// Part 1: https://www.youtube.com/watch?v=lsEpsoiLPOU
// Part 2: https://www.youtube.com/watch?v=6rIhJLKBY2E
const numColours = 3;

if (numColours*(numColours+1)/2 !== String(id).length) throw "id and numColours mismatch";

let rulesKeys = new Array();

for (let i = 1; i <= numColours; i++) rulesKeys.push(...new Array(i).fill(i));
rulesKeys = rulesKeys.map((x, i) => [i - Math.floor((x-1)*x/2) + 1, x]); // unreadable code D:

const rulesMap = new Map();

String(id)
    .split("")
    .map(Number)
    .forEach((rule, index) => {
        rulesMap.set(rulesKeys[index].join(","), rule);
        rulesMap.set(rulesKeys[index].toReversed().join(","), rule);
    });

for (let i = 0; i <= numColours; i++) {
    rulesMap.set([0, i].join(","), 0);
    rulesMap.set([i, 0].join(","), 0);
}

rulesMap.set([0, 1].join(","), 1);
rulesMap.set([1, 0].join(","), 1);

//console.log("rules:", rulesMap);

// fill with background colour
ctx.fillStyle = colours[0];
ctx.fillRect(0, 0, width, height);

function computeLine(lineNo) {
    const prevLineData = ctx.getImageData(0, lineNo*2-1, width, 1).data;
    for (
        let x = (lineNo-1)%2; // move over 1 pixel on odd lines
        x < width-(lineNo-1)%2; // don't overshoot the canvas
        x += 2 // 2 pixels per cell
    ) {
        // starting pixel
        if (lineNo === 0) {
            if (x !== Math.floor(width/2)-1+lineNo%2) continue;

            ctx.fillStyle = colours[1];
            ctx.fillRect(x, lineNo*2, 2, 2);

            continue;
        }

        // this is good optimization
        // trongle check
        // check if we're too far left
        if (x < width/2 - lineNo - 1) continue;
        // check if we're too far right
        if (x > width/2 + lineNo - 1) continue;

        // ~80ms at 2000 size
        // get the data of parent cells from the image
        const dataLeftString  = prevLineData[x*4  ] + "," +
                                prevLineData[x*4+1] + "," +
                                prevLineData[x*4+2] + "," +
                                prevLineData[x*4+3];
        const dataRightString = prevLineData[x*4+4] + "," +
                                prevLineData[x*4+5] + "," +
                                prevLineData[x*4+6] + "," +
                                prevLineData[x*4+7];

        // ~50ms at 2000 size
        const left  = dataMapColour.get(dataLeftString );
        const right = dataMapColour.get(dataRightString);

        // ~70ms at 2000 size
        const newColour = computeColour(left, right);

        // ~10ms at 2000 size
        if (newColour === undefined || newColour === null) {
            console.error("colours from:", left, right);
            console.error("newColour:", newColour);
            throw "no colour :(";
        };

        // ~20ms at 2000 size
        ctx.fillStyle = colours[newColour];
        // ~170ms at 2000 size
        ctx.fillRect(x, lineNo*2, 2, 2);
    }
}

// ~20ms at 2000 size
function computeColour(left, right) {
    const ruleName = left + "," + right; // stringify it for map lookup
    return rulesMap.get(ruleName);
}

const notReadyText = "(not ready) ";
downloadButton.href = "#";
downloadButton.innerText = "(not ready) " + downloadButton.innerText;

const startTime = performance.now();
console.log("computing started at:", startTime);
for (let i = 0; i < height/2; i++) {
    computeLine(i);
}

const endTime = performance.now();
console.log("computing ended at:", endTime);

console.log(`total time: ${((endTime-startTime)/1000).toFixed(4)}s`);

// set up button to download the image
const img = canvas.toDataURL("image/png");
downloadButton.href = img;
downloadButton.innerText = downloadButton.innerText.replace(notReadyText, "");
