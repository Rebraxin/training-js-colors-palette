// Selections & Variables
const colorDivs = document.querySelectorAll(".color");
const generateButton = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustements = document.querySelectorAll(".close-adjustement");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;
let savedPalettes = []; 

// Events listeners
generateButton.addEventListener("click", randomColors);
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  setTimeout(() => {
    popup.classList.remove("active");
    popupBox.classList.remove("active");
  }, 600);
});
adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustementPanel(index);
  });
});
closeAdjustements.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustementPanel(index);
  });
});
lockButton.forEach((button, index) => {
  button.addEventListener("click", (evt) => {
    lockLayer(evt, index);
  });
});

// Functions
// Color Generator
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];

  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    // Add it in array
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    // Add color to the background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    // Check for contrast
    checkTextContrast(randomColor, hexText);

    // Initial Colorise Sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  // Reset Inputs
  resetInputs();

  // Checking button contrast
  adjustButton.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButton[index]);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  //Scale Saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  // Scale Brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);
  //Update Input Colors
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)}, ${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(evt) {
  const index =
    evt.target.getAttribute("data-bright") ||
    evt.target.getAttribute("data-sat") ||
    evt.target.getAttribute("data-hue");
  // console.log(evt.target);
  let sliders = evt.target.parentElement.querySelectorAll('input[type="range"');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];
  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);
  colorDivs[index].style.backgroundColor = color;
  // Colorize sliders
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  // console.log(color);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();
  // Check contrast
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const element = document.createElement("textarea");
  element.value = hex.innerText;
  document.body.appendChild(element);
  element.select();
  document.execCommand("copy");
  document.body.removeChild(element);
  // Popup animation
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function openAdjustementPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

function closeAdjustementPanel(index) {
  sliderContainers[index].classList.remove("active");
}

function lockLayer(evt, index) {
  const lockSVG = evt.target.children[0];
  const activeBg = colorDivs[index];
  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    evt.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    evt.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

// Implement Save Palette & Local Storage
// Selections
const saveButton = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryButton = document.querySelector(".library");
const closeLibraryButton = document.querySelector(".close-library");

// Events Listeners
saveButton.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryButton.addEventListener("click", openLibrary);
closeLibraryButton.addEventListener("click", closeLibrary);

// Functions
function openPalette(evt) {
  const popup = saveContainer.children[0];
  // console.log(popup);
  saveContainer.classList.add("active");
  popup.classList.add("active");
  saveInput.focus();
}

function closePalette(evt) {
  const popup = saveContainer.children[0];
  // console.log(popup);
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  saveInput.value = "";
}

function savePalette(evt) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  // Generate Object
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  let paletteNr;
  if (paletteObjects) {
    paletteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalettes.length;
  }

  const paletteObject = { name, colors, nr: paletteNr };
  savedPalettes.push(paletteObject);
  // console.log(savedPalettes);
  // Save to Local Storage
  saveToLocal(paletteObject);
  saveInput.value = "";
  // Generate Palette for Library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObject.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObject.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteButton = document.createElement("button");
  paletteButton.classList.add("pick-palette-button");
  paletteButton.classList.add(paletteObject.nr);
  paletteButton.innerText = "Select";

  // Attach event to select button
  paletteButton.addEventListener("click", (evt) => {
    closeLibrary();
    const paletteIndex = evt.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
  });

  // Append to Library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteButton);
  libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObject) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObject);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}

function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    //Local Palettes
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    // *2

    savedPalettes = [...paletteObjects];
    paletteObjects.forEach(paletteObject => {
      //Generate the palette for Library
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObject.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObject.colors.forEach(smallColor => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-button");
      paletteBtn.classList.add(paletteObject.nr);
      paletteBtn.innerText = "Select";

      //Attach event to the btn
      paletteBtn.addEventListener("click", e => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });

      //Append to Library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(palette);
    });
  }
}

// localStorage.clear();
getLocal();
randomColors();
