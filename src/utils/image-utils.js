export const handleImageUpload = (file) => {
  return new Promise((resolve, reject) => {
    // Check file size first
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit for initial file
      reject(
        new Error("File is too large. Please select an image under 10MB.")
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Set maximum dimensions - reduced from 800x800 to 600x600
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;

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

        // Start with quality 0.6 (reduced from 0.7)
        let quality = 0.6;
        let result = canvas.toDataURL("image/jpeg", quality);

        // Progressive compression if needed
        // Estimate base64 size to file size (roughly 0.75x)
        const estimateSize = (dataUrl) => {
          return Math.round((dataUrl.length * 3) / 4);
        };

        // Keep reducing quality until we're under 450KB (allowing some buffer)
        while (estimateSize(result) > 450 * 1024 && quality > 0.1) {
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
