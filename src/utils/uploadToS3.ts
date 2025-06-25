import * as fs from 'fs';
import * as path from 'path';
import mime from 'mime-types'
import { promisify } from 'util';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const secret = process.env.SECRET as string
const accessKey = process.env.ACCESS_KEY as string

const s3Client = new S3Client({
    region:"ap-south-1",
    credentials:{
        accessKeyId:accessKey,
        secretAccessKey:secret
    }
})

const bucketName = process.env.BUCKET_NAME as string;

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

async function getAllFiles(dirPath: string): Promise<string[]> {
  let results: string[] = [];
  const list = await readdir(dirPath);
  for (const file of list) {
    const filePath = path.join(dirPath, file);
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      const nested = await getAllFiles(filePath);
      results = results.concat(nested);
    } else {
      results.push(filePath);
    }
  }
  return results;
}

async function uploadFileToS3(filePath: string, s3Key: string) {
  const fileContent = await readFile(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: fileContent,
    ContentType: contentType,
  });

  await s3Client.send(command);
  console.log(`✅ Uploaded: ${s3Key}`);
}

// ✅ Upload public thumbnail function
export async function uploadPublicThumbnail(thumbnailPath: string, videoId: string): Promise<string> {
  try {
    const fileContent = await readFile(thumbnailPath);
    const fileExtension = path.extname(thumbnailPath).toLowerCase();
    
    // ✅ Determine content type for images
    const contentType = getImageContentType(fileExtension);
    
    const s3Key = `public/thumbnails/${videoId}${fileExtension}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: 'max-age=31536000', // ✅ Cache for 1 year
      Metadata: {
        'uploaded-by': 'rotflix-backend',
        'video-id': videoId,
        'file-type': 'thumbnail'
      }
    });

    await s3Client.send(command);
    console.log(`✅ Public thumbnail uploaded: ${s3Key}`);
    
    // ✅ Return the public S3 URL
    const publicUrl = `https://${bucketName}.s3.amazonaws.com/public/thumbnails/${videoId}${fileExtension}`;
    return publicUrl;
    
  } catch (error) {
    console.error('❌ Error uploading thumbnail:', error);
    throw new Error(`Failed to upload thumbnail: ${error}`);
  }
}

// ✅ Helper function to get proper content type for images
function getImageContentType(extension: string): string {
  const imageTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };
  
  return imageTypes[extension] || 'image/jpeg';
}

// 3. Upload full HLS folder
export async function uploadHLSFolder(localDir: string, videoId: string) {
  const allFiles = await getAllFiles(localDir);

  await Promise.all(
    allFiles.map(async (filePath) => {
      const relativePath = path.relative(localDir, filePath);
      const s3Key = `videos/${videoId}/${relativePath.replace(/\\/g, '/')}`;
      await uploadFileToS3(filePath, s3Key);
    })
  );

  console.log('✅ All files uploaded to S3!');
}

export function deleteLocalFolder(folderPath: string) {
  fs.rmSync(folderPath, { recursive: true, force: true });
  console.log('🧹 Deleted local folder:', folderPath);
}

// ✅ Helper function to delete a single file
export function deleteLocalFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🧹 Deleted local file:', filePath);
    }
  } catch (error) {
    console.error('❌ Error deleting file:', filePath, error);
  }
}