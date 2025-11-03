import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadViewingPhoto(
  viewingId: string,
  file: Buffer,
  filename: string
): Promise<string> {
  const key = `viewings/${viewingId}/${Date.now()}-${filename}`

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: file,
      ContentType: 'image/jpeg',
    })
  )

  // Return public URL
  return `https://pub-${process.env.R2_BUCKET_ID}.r2.dev/${key}`
}

export async function compressImage(buffer: Buffer): Promise<Buffer> {
  // For MVP, we'll skip compression
  // In production, use sharp or similar library
  return buffer
}
