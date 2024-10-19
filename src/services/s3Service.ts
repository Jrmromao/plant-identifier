// src/services/s3Service.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function uploadImage(file: File, userId: string): Promise<string> {
  const fileName = `${userId}/${Date.now()}-${file.name}`;
  const fileBuffer = await file.arrayBuffer();

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(fileBuffer),
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return fileName;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload image");
  }
}

export async function getImageUrl(fileName: string): Promise<string> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
  };

  try {
    const command = new GetObjectCommand(params);
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to get image URL");
  }
}