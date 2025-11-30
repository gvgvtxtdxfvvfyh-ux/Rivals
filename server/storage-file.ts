import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";

interface FileUploadResult {
  url: string;
  filename: string;
}

export interface IFileStorage {
  uploadFile(bucket: string, file: Express.Multer.File): Promise<FileUploadResult>;
  deleteFile(bucket: string, filename: string): Promise<void>;
  getPublicUrl(bucket: string, filename: string): string;
}

class LocalFileStorage implements IFileStorage {
  async uploadFile(
    bucket: string,
    file: Express.Multer.File
  ): Promise<FileUploadResult> {
    const uploadDir = path.join(process.cwd(), "uploads", bucket);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
      file.originalname
    )}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    return {
      filename,
      url: `/uploads/${bucket}/${filename}`,
    };
  }

  async deleteFile(bucket: string, filename: string): Promise<void> {
    const filepath = path.join(process.cwd(), "uploads", bucket, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  getPublicUrl(bucket: string, filename: string): string {
    return `/uploads/${bucket}/${filename}`;
  }
}

class SupabaseFileStorage implements IFileStorage {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required"
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(
    bucket: string,
    file: Express.Multer.File
  ): Promise<FileUploadResult> {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
      file.originalname
    )}`;

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data } = this.supabase.storage.from(bucket).getPublicUrl(filename);

    return {
      filename,
      url: data.publicUrl,
    };
  }

  async deleteFile(bucket: string, filename: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([filename]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  getPublicUrl(bucket: string, filename: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(filename);
    return data.publicUrl;
  }
}

function createFileStorage(): IFileStorage {
  const useSupabase =
    process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

  if (useSupabase) {
    return new SupabaseFileStorage();
  }

  return new LocalFileStorage();
}

export const fileStorage = createFileStorage();
