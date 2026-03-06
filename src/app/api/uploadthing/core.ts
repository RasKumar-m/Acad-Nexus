import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
  projectFile: f({
    // 1. Images (png, jpg, jpeg, etc.)
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    
    // 2. Videos (mp4, webm, etc.)
    video: { maxFileSize: "64MB", maxFileCount: 1 }, // Set higher size for videos
    
    // 3. PDFs specifically
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    
    // 4. "Blob" handles all other binary/document files (docx, xlsx, pptx, zip, rar, etc.)
    blob: { maxFileSize: "32MB", maxFileCount: 1 } 
  })
    .middleware(async () => {
        // This runs before the upload starts
      return { uploadedAt: new Date() };
    })
    .onUploadComplete(async ({ file }) => {
      // This fires when the upload finishes successfully
      console.log("File uploaded successfully:", file.url);
      
      return { url: file.url, name: file.name };
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter