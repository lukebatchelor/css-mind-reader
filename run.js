const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");
const distDir = path.join(__dirname, "dist");
const srcHtmlFile = path.join(srcDir, "index.html");
const srcStylesCSSFile = path.join(srcDir, "styles.css");
const srcHtmlStr = fs.readFileSync(srcHtmlFile, "utf-8");
const srcStylesStr = fs.readFileSync(srcStylesCSSFile, "utf-8");
const distHtmlFile = path.join(distDir, "index.html");
const distStylesCSSFile = path.join(distDir, "styles.css");

if (fs.existsSync(distDir)) {
  console.log("Deleting existing dist");
  fs.rmSync(distDir, { force: true, recursive: true });
}

const htmlLines = srcHtmlStr.split("\n");
let newHtmlLines = [];

const beginDuplicationMarker = "<!-- Begin Duplication -->";
const endDuplicationMarker = "<!-- End Duplication -->";
const insertRowsMarker = "<!-- Insert Rows -->";
const insertEmojiMarker = "<!-- Insert Emoji -->";
const emojisStr = "😜🥰😂😁🤣🥹🤨🥳🥸😍😎😫😔🤩🤯😱😭😳🤔😮😵🫣🤤🥴😐";
const emojis = [...emojisStr];
const numTimesToDuplicate = 8;
const chosenEmojis = [];

// first find the chosenEmojis
while (chosenEmojis.length < numTimesToDuplicate) {
  const nextEmoji = randElement(emojis);
  if (chosenEmojis.includes(nextEmoji)) continue;
  chosenEmojis.push(nextEmoji);
}
console.log({ chosenEmojis });
// next, we'll process each line of the html file one by one
let curLineIdx = 0;
let duplicationIdx = 0;
let prevDuplicationBeginMarkerIdx = -1;
while (curLineIdx < htmlLines.length) {
  const line = htmlLines[curLineIdx];
  if (line.includes(beginDuplicationMarker)) {
    prevDuplicationBeginMarkerIdx = curLineIdx;
    duplicationIdx = 0;
  } else if (line.includes(endDuplicationMarker)) {
    duplicationIdx += 1;
    if (duplicationIdx !== numTimesToDuplicate) {
      // we have not finished duplicating this block - go back to previous marker
      curLineIdx = prevDuplicationBeginMarkerIdx;
    }
  } else if (line.includes(insertRowsMarker)) {
    const newLinesToAdd = generateRowsHtmlLines(chosenEmojis[duplicationIdx]);
    newHtmlLines = [...newHtmlLines, ...newLinesToAdd];
  } else if (line.includes("page-memorise")) {
    newHtmlLines.push(
      line.replace("page-memorise", `page-memorise-${duplicationIdx}`)
    );
  } else if (line.includes("page-ready")) {
    newHtmlLines.push(
      line.replace("page-ready", `page-ready-${duplicationIdx}`)
    );
  } else if (line.includes("page-reveal")) {
    newHtmlLines.push(
      line.replace("page-reveal", `page-reveal-${duplicationIdx}`)
    );
  } else if (line.includes(insertEmojiMarker)) {
    newHtmlLines.push(chosenEmojis[duplicationIdx]);
  } else {
    newHtmlLines.push(line);
  }

  curLineIdx += 1;
}

// write out dist file
const newHtmlStr = newHtmlLines.join("\n");
fs.mkdirSync(distDir);
fs.writeFileSync(distHtmlFile, newHtmlStr, "utf-8");
fs.writeFileSync(distStylesCSSFile, srcStylesStr, "utf-8");

function randBetween(from, to) {
  return Math.floor(Math.random() * (to - from + 1)) + from;
}
function randElement(arr) {
  return arr[randBetween(0, arr.length - 1)];
}
function generateRowsHtmlLines(chosenEmoji) {
  const totalCells = 100;
  let numCells = 0;
  const newLinesToAdd = [];

  while (numCells < totalCells) {
    // add random new cells between 4 and 9, unless that would put us over 100
    const newCells = Math.min(randBetween(6, 9), totalCells - numCells);
    newLinesToAdd.push('      <div class="row">');
    for (let i = 0; i < newCells; i++) {
      const cellLabel = numCells + i + 1;
      const cellEmoji = cellLabel % 9 === 0 ? chosenEmoji : randElement(emojis);
      newLinesToAdd.push('        <div class="cell">');
      newLinesToAdd.push(`          <div class="emoji">${cellEmoji}</div>`);
      newLinesToAdd.push(`          <div class="label">${cellLabel}</div>`);
      newLinesToAdd.push("        </div>");
    }
    newLinesToAdd.push("      </div>");
    numCells += newCells;
  }

  return newLinesToAdd;
}
