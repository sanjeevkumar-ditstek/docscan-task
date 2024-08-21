import AWS from 'aws-sdk';

// Configure AWS SDK with your credentials
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

// Create an S3 instance
const s3 = new AWS.S3();

// Specify your bucket name
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

/**
 * Uploads an image to S3 bucket
 * @param {string} file
 * @param {string} folderName 
 * @returns {Promise<string>} - Promise that resolves to the URL of the uploaded image
 */
export const uploadToS3 = async (file, folderName) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${folderName}/${Date.now()}.${file.originalname.split('.').pop()}`,
    Body: Buffer.from(file.buffer),
    ContentType: 'image/jpeg',
    ServerSideEncryption: 'AES256',
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Key;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
export const checkS3FolderSize = async (path, fileSize) => {
  try {
    let totalSize = 0;
    let continuationToken = null;
    const maxBytes = 1073741824; // Bytes in 1GB
    do {
        const params = {
            Bucket: BUCKET_NAME,
            Prefix: path,
            ContinuationToken: continuationToken // For pagination
        };

        const response = await s3.listObjectsV2(params).promise();
        const contents = response.Contents;

        contents.forEach(file => {
            totalSize += file.Size;
        });

        continuationToken = response.IsTruncated ? response.NextContinuationToken : null;
    } while (continuationToken);

    // Convert total size from bytes to gigabytes
    totalSize += fileSize;
    if(totalSize >= maxBytes) {
      return false
    }
    else {
      return true
    }
} catch (error) {
    console.error('Error calculating folder size:', error);
}
}

export const generatePresignedUrl = async (url) => {
  const urlObject = new URL(`${process.env.S3_BASEURL}${url}`);
  const key = urlObject.pathname.substring(1); // Remove leading '/'
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: 1800,
  };

  return s3.getSignedUrl('getObject', params);
};

export const deleteFromS3 = async (key: string) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  try {
    return await s3.deleteObject(params).promise();
    
  } catch (error) {
    console.error(`Error deleting file ${key}:`, error);
  }
};

export const getParsedFile = async (key: string) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };
  
  try {
    const s3Stream = s3.getObject(params).createReadStream();
    return s3Stream;
  } catch (error) {
    console.error(`Unable to parse file ${key}:`, error);
};


}