const fileInput = document.querySelector(".file-input"),
  filterOptions = document.querySelectorAll(".filter button"),
  uploadButton = document.querySelector(".upload"),
  downloadButton = document.querySelector(".controls .download"),
  previewImage = document.querySelector(".right-side img"),
  filterName = document.querySelector(".filter-info .name"),
  filterSlider = document.querySelector(".slider input"),
  sliderValue = document.querySelector(".filter-info .value"),
  rotateOpt = document.querySelectorAll(".rotate button"),
  resetButton = document.querySelector(".reset-filter"),
  widthInput = document.querySelector(".column-width input"),
  heightInput = document.querySelector(".column-height input"),
  ratioInput = document.querySelector(".ratio-checkbox input"),
  compressButton = document.querySelector(".compress button");
//   deleteFilterButton = document.querySelector(".delete-filter");

let brightness = 100,
  saturation = 100,
  inversion = 0,
  grayscale = 0;
let imgRatio;
let rotate = 0;
let flipHor = 1,
  flipVert = 1;

// Function to compress an image
function compressImage(image) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set the canvas dimensions to the original image dimensions
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw the original image onto the canvas
    context.drawImage(image, 0, 0);

    // Get the compressed image data as a base64-encoded string
    canvas.toBlob(
      blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      },
      'image/jpeg',
      0.8 // Adjust the compression quality here (0.0 to 1.0)
    );
  });
}

// Upload image
const loadImage = () => {
    let file = fileInput.files[0];
    if (!file) {
      return; // If image not selected
    } else {
      previewImage.src = URL.createObjectURL(file); // Set the file URL as the preview image

      previewImage.addEventListener("load", () => {
        document.querySelector(".container").classList.remove("disable");

        widthInput.value = previewImage.naturalWidth;
        heightInput.value = previewImage.naturalHeight;
  
        imgRatio = previewImage.naturalWidth / previewImage.naturalHeight;
      });
  
      // Clear the file input value to enable uploading the same image again
      fileInput.value = "";
    }
  };
  

rotateOpt.forEach(option => {
  option.addEventListener("click", () => {
    if (option.id === "left") {
      rotate -= 90;
    } else if (option.id === "right") {
      rotate += 90;
    } else if (option.id === "horizontal") {
      flipHor = flipHor === 1 ? -1 : 1;
    } else if (option.id === "vertical") {
      flipVert = flipVert === 1 ? -1 : 1;
    }
    applyFilters();
  });
});

filterOptions.forEach(option => {
  option.addEventListener("click", () => {
    document.querySelector(".filter .enable").classList.remove("enable");
    option.classList.add("enable");
    filterName.innerText = option.innerText;

    if (option.id === "brightness") {
      filterSlider.max = "200";
      filterSlider.value = brightness;
      sliderValue.innerText = `${brightness}%`;
    } else if (option.id === "saturation") {
      filterSlider.max = "200";
      filterSlider.value = saturation;
      sliderValue.innerText = `${saturation}%`;
    } else if (option.id === "inversion") {
      filterSlider.max = "100";
      filterSlider.value = inversion;
      sliderValue.innerText = `${inversion}%`;
    } else if (option.id === "grayscale") {
      filterSlider.max = "100";
      filterSlider.value = grayscale;
      sliderValue.innerText = `${grayscale}%`;
    }
  });
});

const updateFilterValue = () => {
  sliderValue.innerText = `${filterSlider.value}%`;

  const selectedFilter = document.querySelector(".filter .enable");

  if (selectedFilter.id === "brightness") {
    brightness = filterSlider.value;
  } else if (selectedFilter.id === "saturation") {
    saturation = filterSlider.value;
  } else if (selectedFilter.id === "inversion") {
    inversion = filterSlider.value;
  } else if (selectedFilter.id === "grayscale") {
    grayscale = filterSlider.value;
  }
  applyFilters();
};

const applyFilters = () => {
  previewImage.style.transform = `rotate(${rotate}deg) scale(${flipHor},${flipVert})`;
  previewImage.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
};

const resetFilter = () => {
  brightness = 100;
  saturation = 100;
  inversion = 0;
  grayscale = 0;
  rotate = 0;
  flipHor = 1;
  flipVert = 1;
  filterOptions[0].click();
  applyFilters();
};

widthInput.addEventListener("keyup", () => {
  const height = ratioInput.checked
    ? widthInput.value / imgRatio
    : heightInput.value;
  heightInput.value = Math.floor(height);
});

heightInput.addEventListener("keyup", () => {
  const width = ratioInput.checked
    ? heightInput.value * imgRatio
    : widthInput.value;
  widthInput.value = Math.floor(width);
});

const downloadImage = () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = widthInput.value;
  canvas.height = heightInput.value;

  ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (rotate !== 0) {
    ctx.rotate(rotate * Math.PI / 180);
  }
  ctx.scale(flipHor, flipVert);
  ctx.drawImage(
    previewImage,
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );

  const link = document.createElement("a");
  link.download = "image.jpeg";
  link.href = canvas.toDataURL();
  link.click();
};

// Compress the loaded image
compressButton.addEventListener("click", async () => {
    try {
      const compressedImageData = await compressImage(previewImage);
      downloadCompressedImage(compressedImageData);
    } catch (error) {
      console.error("Error compressing image:", error);
    }
  });
  
function downloadCompressedImage(dataURL) {
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "compressed_image.jpeg";
    link.click();
}

// deleteFilterButton.addEventListener("click", () => {
//     // Remove the image
//     previewImage.src = "upload image.png";

//     // Reset other filter values
//     resetFilter();

//     // Clear the file input value
//     fileInput.value = "";
// });

  

downloadButton.addEventListener("click", downloadImage);
fileInput.addEventListener("change", loadImage);
filterSlider.addEventListener("input", updateFilterValue);
uploadButton.addEventListener("click", () => fileInput.click());
resetButton.addEventListener("click", resetFilter);
