declare module "multer-storage-cloudinary" {
  import { StorageEngine } from "multer";
  import { v2 as cloudinary } from "cloudinary";

  export interface Options {
    cloudinary: typeof cloudinary;
    params?: {
      folder?: string;
      allowed_formats?: string[];
      public_id?: (req: any, file: any) => string;
      transformation?: Array<{ [key: string]: any }>;
      [key: string]: any;
    };
  }

  export class CloudinaryStorage implements StorageEngine {
    constructor(options: Options);
    _handleFile(req: any, file: any, callback: any): void;
    _removeFile(req: any, file: any, callback: any): void;
  }
}
