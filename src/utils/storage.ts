import {
    uploadData,
    getUrl,
    remove,
} from 'aws-amplify/storage';
import { v4 as uuidv4 } from 'uuid';  // use uuid library

/**
 * Upload a bucket-list image to S3.
 * Returns the S3 storage path/key to save in DynamoDB.
 * (Uses the default storage bucket configured in amplify_outputs.json)
 */
export async function uploadBucketImage(file: File): Promise<string> {
    const extension =
        file.name.split('.').pop()?.toLowerCase() || 'jpg';

    // UUID generation
    const fileName = `${uuidv4()}.${extension}`;
    const key = `bucket-list-images/${fileName}`;

    const result = await uploadData({
        path: key,
        data: file,
        options: {
            contentType: file.type,
        },
    }).result;

    return result.path;
}

/**
 * Generate a temporary signed URL for an S3 image from the bucket.
 */
export async function getBucketImageUrl(
    key: string
): Promise<string> {
    if (!key) return '';

    const result = await getUrl({
        path: key,
        options: {
            expiresIn: 3600,
        },
    });

    return result.url.toString();
}

/**
 * Delete an image from the specified S3 bucket.
 */
export async function deleteBucketImage(
    key: string
): Promise<void> {
    if (!key) return;

    await remove({
        path: key,
    });
}
