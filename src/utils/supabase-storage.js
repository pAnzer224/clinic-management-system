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
      "Cache-Control": "no-cache",
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
    // Generate a more efficient filename
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}${getExtension(file.name)}`;

    // Compress image if it's a compatible type and over 1MB
    let fileToUpload = file;
    if (file.size > 1024 * 1024 && isImageCompressible(file.type)) {
      fileToUpload = await compressImage(file);
    }

    // Pre-calculate the public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/public/${fileName}`;

    // Perform the upload with optimized settings
    const { error } = await supabase.storage
      .from(bucket)
      .upload(`public/${fileName}`, fileToUpload, {
        cacheControl: "3600",
        upsert: true, // Changed to true for faster overwrite
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
 * Compresses an image file to reduce size and upload time
 * @param {File} file The image file to compress
 * @returns {Promise<Blob>} A compressed version of the image
 */
async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type,
          0.7 // quality
        );
      };
    };
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

/**
 * Uploads a document to Supabase Storage
 * @param {File} file The document file to upload
 * @param {string} bucket The storage bucket name (default: 'image-uploads')
 * @returns {Promise<string>} The public URL of the uploaded document
 */
export async function uploadDocumentToSupabase(file, bucket = "image-uploads") {
  if (!file) {
    throw new Error("No document provided");
  }

  try {
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}${getExtension(file.name)}`;
    const folder = "documents";

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${folder}/${fileName}`;

    let fileToUpload = file;
    if (file.size > 1024 * 1024 && isImageCompressible(file.type)) {
      fileToUpload = await compressImage(file);
    }

    // Perform the upload with optimized settings
    const { error } = await supabase.storage
      .from(bucket)
      .upload(`${folder}/${fileName}`, fileToUpload, {
        cacheControl: "3600",
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
