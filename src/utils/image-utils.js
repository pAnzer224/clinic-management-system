export const handleImageUpload = (file) => {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      reject(new Error("File is too large. Please select an image under 5MB."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Reduce maximum dimensions
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Start with lower quality
        let quality = 0.4; // Reduced from 0.6
        let result = canvas.toDataURL("image/jpeg", quality);

        // Keep reducing quality until under 300KB
        while (
          Math.round((result.length * 3) / 4) > 300 * 1024 &&
          quality > 0.1
        ) {
          quality -= 0.1;
          result = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(result);
      };
      img.src = event.target.result;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
