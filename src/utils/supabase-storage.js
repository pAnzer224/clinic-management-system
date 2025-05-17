import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wfornkmxdpgtxvatwzne.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmb3Jua214ZHBndHh2YXR3em5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMjY5MzAsImV4cCI6MjA1NjgwMjkzMH0.hkUPR7wV1iVg5Zxv-1zHYVPjiO1QFPgNvuB-jHuojdY";
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
  global: {
    headers: {
      "Cache-Control": "max-age=3600",
    },
  },
});

/**
 * Uploads an image to Supabase Storage with optimized performance
 * @param {File} file The file to upload
 * @param {string} bucket The storage bucket name (default: 'image-uploads')
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export async function uploadImageToSupabase(file, bucket = "image-uploads") {
  if (!file) {
    throw new Error("No file provided");
  }

  try {
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}${getExtension(file.name)}`;

    // Always compress image files
    let fileToUpload = file;
    if (isImageCompressible(file.type)) {
      fileToUpload = await compressImage(file, 800); // Max width 800px for profile images
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/public/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(`public/${fileName}`, fileToUpload, {
        cacheControl: "31536000", // Cache for 1 year
        upsert: true,
        contentType: file.type,
      });

    if (error) throw error;
    return publicUrl;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}

/**
 * Uploads a document to Supabase Storage
 * @param {File} file The document file to upload
 * @param {string} folderName The folder name to store the document (default: 'documents')
 * @param {string} bucket The storage bucket name (default: 'image-uploads')
 * @returns {Promise<string>} The public URL of the uploaded document
 */
export async function uploadDocumentToSupabase(
  file,
  folderName = "documents",
  bucket = "image-uploads"
) {
  if (!file) {
    throw new Error("No document provided");
  }

  try {
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}${getExtension(file.name)}`;

    let fileToUpload = file;
    if (file.size > 1024 * 1024 && isImageCompressible(file.type)) {
      fileToUpload = await compressImage(file, 1200); // Higher quality for documents
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${folderName}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(`${folderName}/${fileName}`, fileToUpload, {
        cacheControl: "31536000", // Cache for 1 year
        upsert: true,
        contentType: file.type,
      });

    if (error) throw error;
    return publicUrl;
  } catch (error) {
    console.error("Document upload failed:", error);
    throw error;
  }
}

/**
 * Compresses an image file to reduce size and improve load time
 * @param {File} file The image file to compress
 * @param {number} maxSize The maximum width/height of the image
 * @returns {Promise<Blob>} A compressed version of the image
 */
async function compressImage(file, maxSize = 800) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize based on the longer dimension
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Adjust quality based on file type
        const quality =
          file.type === "image/jpeg" || file.type === "image/jpg" ? 0.8 : 0.9;

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type,
          quality
        );
      };
    };
  });
}

/**
 * Helper to compress existing images in Supabase storage
 * @param {string} url The URL of the image to compress
 * @param {number} maxSize Maximum width/height for the compressed image
 * @returns {Promise<Blob>} The compressed image blob
 */
export async function compressExistingImage(url, maxSize = 800) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.8
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

/**
 * Checks if the image type is compressible
 * @param {string} mimeType The MIME type of the file
 * @returns {boolean} Whether the file can be compressed
 */
function isImageCompressible(mimeType) {
  return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
    mimeType
  );
}

/**
 * Gets the file extension from a filename
 * @param {string} filename The original filename
 * @returns {string} The file extension including the dot
 */
function getExtension(filename) {
  return filename.substring(filename.lastIndexOf("."));
}
