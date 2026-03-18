import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadImage(file: Express.Multer.File): Promise<any> {
        console.log(`Cloudinary Upload starting: ${file.originalname} (${file.size} bytes)`);
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'food_delivery' },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary Upload Error:', error);
                        return reject(error);
                    }
                    console.log('Cloudinary Upload success:', result?.secure_url || result?.url);
                    resolve(result);
                },
            ).end(file.buffer);
        });
    }
}