// convert-font.js
import fs from "fs";

function toBase64(fontFile, exportName) {
  const fontData = fs.readFileSync(fontFile);
  const base64 = fontData.toString("base64");
  console.log(`export const ${exportName} = "data:font/ttf;base64,${base64}";`);
}

// run conversions
toBase64(
  "./public/fonts/battambang/Battambang-Thin.ttf",
  "BATTAMBANG_THIN_BASE64"
);

toBase64(
  "./public/fonts/battambang/Battambang-Regular.ttf",
  "BATTAMBANG_BASE64"
);
toBase64(
  "./public/fonts/battambang/Battambang-Bold.ttf",
  "BATTAMBANG_BOLD_BASE64"
);
