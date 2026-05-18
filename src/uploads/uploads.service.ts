import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

@Injectable()
export class UploadsService {
  private readonly localUploadDir = path.join(process.cwd(), 'public', 'images');

  constructor() {
    // Ensure local upload directory exists
    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }
  }

  /**
   * Upload an image file.
   * If BunnyCDN credentials are set in .env, upload to BunnyCDN.
   * Otherwise, save locally in public/images/.
   */
  async uploadImage(
    file: Express.Multer.File,
    forceStorage?: 'local' | 'bunny',
    requestHostUrl?: string,
  ): Promise<{ status: boolean; message: string; url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Generate safe, unique filename: GT + timestamp + 4 digit random + original extension
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const fileName = `GT_${Date.now()}_${randomSuffix}${ext}`;

    const useBunny = forceStorage
      ? forceStorage === 'bunny'
      : !!(process.env.BUNNY_API_KEY && process.env.BUNNY_STORAGE_ZONE_NAME);

    if (useBunny) {
      try {
        const url = await this.uploadToBunnyCDN(file.buffer, fileName);
        return {
          status: true,
          message: 'Image uploaded successfully to BunnyCDN',
          url,
        };
      } catch (error) {
        console.error('BunnyCDN upload failed, falling back to local storage:', error.message);
        // Fallback to local storage on error
        const localUrl = this.saveLocally(file.buffer, fileName, requestHostUrl);
        return {
          status: true,
          message: 'BunnyCDN upload failed. Saved to local storage fallback.',
          url: localUrl,
        };
      }
    } else {
      const localUrl = this.saveLocally(file.buffer, fileName, requestHostUrl);
      return {
        status: true,
        message: 'Image uploaded successfully to local storage',
        url: localUrl,
      };
    }
  }

  /**
   * Save file to local public/images folder.
   */
  private saveLocally(buffer: Buffer, fileName: string, requestHostUrl?: string): string {
    const filePath = path.join(this.localUploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    const host = requestHostUrl || 'http://localhost:3000';
    return `${host}/public/images/${fileName}`;
  }

  /**
   * Upload file to BunnyCDN Storage.
   */
  private async uploadToBunnyCDN(buffer: Buffer, fileName: string): Promise<string> {
    const storageZone = process.env.BUNNY_STORAGE_ZONE_NAME || 'vtauprime';
    const apiKey = process.env.BUNNY_API_KEY;
    const region = process.env.BUNNY_STORAGE_REGION || 'sg';
    const cdnDomain = process.env.BUNNY_CDN_DOMAIN || 'https://vtaguprime.b-cdn.net';

    if (!apiKey) {
      throw new Error('BunnyCDN API Key is not configured');
    }

    // Determine storage endpoint hostname
    const hostname = region === 'de' || region === '' 
      ? 'storage.bunnycdn.com' 
      : `${region}.storage.bunnycdn.com`;

    // Path in storage: /<storage_zone>/images/<filename>
    const storagePath = `/${storageZone}/images/${fileName}`;
    const url = `https://${hostname}${storagePath}`;

    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      
      const options: https.RequestOptions = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname,
        method: 'PUT',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'application/octet-stream',
          'Content-Length': buffer.length,
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            // Success! Construct the CDN pull zone URL
            const cleanCdnDomain = cdnDomain.endsWith('/') ? cdnDomain.slice(0, -1) : cdnDomain;
            resolve(`${cleanCdnDomain}/images/${fileName}`);
          } else {
            reject(new Error(`BunnyCDN API returned status ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(buffer);
      req.end();
    });
  }
}
