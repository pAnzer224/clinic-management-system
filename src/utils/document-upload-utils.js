export const handleDocumentUpload = (file) => {
  return new Promise((resolve, reject) => {
    // Increased max file size check (optional, remove if you want no limit)
    if (file.size > 15 * 1024 * 1024) {
      reject(
        new Error("File is too large. Please select a document under 15MB.")
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: event.target.result,
      };
      resolve(fileData);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
