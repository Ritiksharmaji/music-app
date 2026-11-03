import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

import dotenv from "dotenv";
dotenv.config();

// credentials come from the default AWS chain (AWS_PROFILE in .env, env vars, or an IAM role)
const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.AWS_S3_BUCKET;

// media is served through our own API so the bucket can stay private
export const MEDIA_PREFIX = "/api/media/";

export const uploadToS3 = async (file, folder) => {
	const key = `${folder}/${randomUUID()}${path.extname(file.name)}`;

	await s3.send(
		new PutObjectCommand({
			Bucket: BUCKET,
			Key: key,
			Body: fs.createReadStream(file.tempFilePath),
			ContentType: file.mimetype,
		})
	);

	return MEDIA_PREFIX + key;
};

export const deleteFromS3 = async (url) => {
	// seeded songs point at files in frontend/public, not S3
	if (!url?.startsWith(MEDIA_PREFIX)) return;
	await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: url.slice(MEDIA_PREFIX.length) }));
};

export const getMediaUrl = (key) => getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 3600 });
