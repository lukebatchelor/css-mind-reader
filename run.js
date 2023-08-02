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
const insertRowsMarker = "<!-- Insert Rows -->";
const insertRowsLineIdx = htmlLines.findIndex((line) =>
  line.includes(insertRowsMarker)
);
if (insertRowsLineIdx < 0) {
  throw new Error(
    `Unable to find Insert Rows marker in ${srcHtmlFile}: ${insertRowsMarker} `
  );
}

// Add in all the emoji rows
const totalCells = 100;
let numCells = 0;
const newLinesToAdd = [];
const emojisStr = "😜🥰😂😁🤣🥹🤨🥳🥸😍😎😫😔🤩🤯😱😭😳🤔😮😵";
const emojis = [...emojisStr];
const chosenEmoji = randElement(emojis);
console.log({ chosenEmoji });
while (numCells < totalCells) {
  // add random new cells between 4 and 9, unless that would put us over 100
  const newCells = Math.min(randBetween(6, 9), totalCells - numCells);
  console.log("Adding ", newCells, "new cells");
  newLinesToAdd.push('      <div class="row">');
  for (let i = 0; i < newCells; i++) {
    const cellLabel = numCells + i + 1;
    const cellEmoji = cellLabel % 9 === 0 ? chosenEmoji : randElement(emojis);
    newLinesToAdd.push('        <div class="cell">');
    newLinesToAdd.push(`          <div class="emoji">${cellEmoji}</div>`);
    newLinesToAdd.push(`          <div class="label">${cellLabel}</div>`);
    newLinesToAdd.push("        </div>");
  }
  newLinesToAdd.push("</div>");
  numCells += newCells;
}
htmlLines.splice(insertRowsLineIdx, 1, ...newLinesToAdd);

// add in the chosen emoji
const insertEmojiMarker = "<!-- Insert Emoji -->";
const insertEmojiLineIdx = htmlLines.findIndex((line) =>
  line.includes(insertEmojiMarker)
);
if (insertRowsLineIdx < 0) {
  throw new Error(
    `Unable to find Insert Emoji marker in ${srcHtmlFile}: ${insertEmojiMarker} `
  );
}
htmlLines.splice(insertEmojiLineIdx, 1, chosenEmoji);

// write out dist file
const newHtmlStr = htmlLines.join("\n");
fs.mkdirSync(distDir);
fs.writeFileSync(distHtmlFile, newHtmlStr, "utf-8");
fs.writeFileSync(distStylesCSSFile, srcStylesStr, "utf-8");

function randBetween(from, to) {
  return Math.floor(Math.random() * (to - from + 1)) + from;
}
function randElement(arr) {
  return arr[randBetween(0, arr.length - 1)];
}
