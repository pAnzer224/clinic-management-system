export const handleDocumentUpload = (file) => {
  return new Promise((resolve, reject) => {
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
