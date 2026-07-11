console.log("main.js is running at", new Date());
console.log(new Array(2 ** 7).fill("-").join(""));

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", {
    willReadFrequently: true // reading frequently to get the pixel data to compute the stuff and things
});

const width = canvas.width;
const height = canvas.height;

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
// ^ 213321 is cool according to the guy that invented this thing
const numColours = 3;

if (numColours*(numColours+1)/2 !== String(id).length) throw "id and numColours mismatch";

let rulesKeys = new Array();

for (let i = 1; i <= numColours; i++) rulesKeys.push(...new Array(i).fill(i));
rulesKeys = rulesKeys.map((x, i) => [i - Math.floor((x-1)*x/2) + 1, x].join(",")); // unreadable code D:

const rulesMap = new Map();

String(id)
    .split("")
    .map(Number)
    .forEach((rule, index) => {
        console.log("index:", index, "rule:", rule);
        rulesMap.set(rulesKeys[index], rule);
    });

rulesMap.set("0,0", 0);
rulesMap.set("0,1", 1);

console.log("rules:", rulesMap);

// fill with background colour
ctx.fillStyle = colours[0];
ctx.fillRect(0, 0, width, height);

function computeLine(lineNo) {
    //if (lineNo%100 === 0) console.log("computing line:", lineNo);
    console.log("computing line:", lineNo);
    //console.groupCollapsed("computing line:", lineNo);
    for (
        let x = (lineNo-1)%2; // move over 1 pixel on odd lines
        x < width-1; // don't overshoot the canvas
        x += 2 // 2 pixels per cell
    ) {
        computePixel(x, lineNo);
    }
    //console.groupEnd();
}

function computePixel(x, lineNo) {
    if (lineNo === 0) {
        if (x !== Math.floor(width/2)-1) return;

        ctx.fillStyle = colours[1];
        ctx.fillRect(x, lineNo*2, 2, 2);

        return;
    }

    // get the data of parent cells from the image
    const dataLeft  = ctx.getImageData(x  , lineNo*2-1, 1, 1);
    const dataRight = ctx.getImageData(x+1, lineNo*2-1, 1, 1);

    // turn the data into string so I can do map lookup
    const dataLeftString  = Array(dataLeft .data).join(",");
    const dataRightString = Array(dataRight.data).join(",");

    const left  = dataMapColour.get(dataLeftString );
    const right = dataMapColour.get(dataRightString);

    const newColour = computeColour(left, right);

    if (newColour === undefined || newColour === null) {
        console.error("colours from:", left, right);
        console.error("newColour:", newColour);
        throw "no colour :(";
    };

    ctx.fillStyle = colours[newColour];
    ctx.fillRect(x, lineNo*2, 2, 2);
}

function computeColour(left, right) {
    const ruleName = (left < right ? [left, right] : [right, left])// flip around the colours so left is smaller than right
        .join(","); // stringify it for map lookup
    
    return rulesMap.get(ruleName);
}

for (let i = 0; i < height/2; i++) {
    computeLine(i);
}
