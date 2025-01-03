import { Storage } from '@google-cloud/storage';
import path from 'path';

const BUCKET_NAME = 'mywiki-files';
const BASE_URL = `https://storage.googleapis.com/${BUCKET_NAME}`;

export class StorageClient {
  private storage: Storage;
  private bucket: string;

  constructor() {
    this.storage = new Storage();
    this.bucket = BUCKET_NAME;
  }

  /**
   * 記事IDに対応するGCSのパスを生成
   */
  private getArticlePath(articleId: string, fileName: string): string {
    return path.join(articleId, fileName);
  }

  /**
   * ファイルをアップロード
   */
  async uploadFile(
    articleId: string,
    file: Buffer | string,
    fileName: string,
    mimeType?: string
  ): Promise<{ url: string; path: string }> {
    const filePath = this.getArticlePath(articleId, fileName);
    const bucket = this.storage.bucket(this.bucket);
    const blob = bucket.file(filePath);

    const options = {
      contentType: mimeType,
      metadata: {
        cacheControl: 'public, max-age=31536000', // 1年間のキャッシュ
      },
    };

    try {
      await blob.save(file, options);
      
      return {
        url: `${BASE_URL}/${filePath}`,
        path: filePath
      };
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error('ファイルのアップロードに失敗しました');
    }
  }

  /**
   * 記事に関連するファイル一覧を取得
   */
  async listFiles(articleId: string): Promise<Array<{ name: string; url: string }>> {
    const bucket = this.storage.bucket(this.bucket);
    const [files] = await bucket.getFiles({
      prefix: `${articleId}/`,
    });

    return files.map(file => ({
      name: path.basename(file.name),
      url: `${BASE_URL}/${file.name}`
    }));
  }

  /**
   * ファイルを削除
   */
  async deleteFile(articleId: string, fileName: string): Promise<void> {
    const filePath = this.getArticlePath(articleId, fileName);
    const bucket = this.storage.bucket(this.bucket);
    const file = bucket.file(filePath);

    try {
      await file.delete();
    } catch (error) {
      console.error('File deletion failed:', error);
      throw new Error('ファイルの削除に失敗しました');
    }
  }

  /**
   * 記事に関連するファイルをすべて削除
   */
  async deleteArticleFiles(articleId: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucket);
    const [files] = await bucket.getFiles({
      prefix: `${articleId}/`,
    });

    await Promise.all(files.map(file => file.delete()));
  }
}

// シングルトンインスタンスをエクスポート
export const storageClient = new StorageClient();