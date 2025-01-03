import { NextRequest, NextResponse } from 'next/server';
import { storageClient } from '@/lib/storage/client';

// ファイル一覧を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const files = await storageClient.listFiles(id);
    return NextResponse.json(files);
  } catch (error) {
    console.error('Failed to list files:', error);
    return NextResponse.json(
      { error: 'ファイル一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// ファイルをアップロード
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが指定されていません' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const result = await storageClient.uploadFile(
      id,
      Buffer.from(buffer),
      file.name,
      file.type
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    );
  }
}