import { NextRequest, NextResponse } from 'next/server';
import { ArticleModel } from '@/models/article';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const article = await ArticleModel.get((await params).id);
    if (!article) {
      return NextResponse.json(
        { error: '記事が見つかりません' },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: article });
  } catch (error) {
    console.error('記事の取得に失敗:', error);
    return NextResponse.json(
      { error: '記事の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    await ArticleModel.update((await params).id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('記事の更新に失敗:', error);
    return NextResponse.json(
      { error: '記事の更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ArticleModel.delete((await params).id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('記事の削除に失敗:', error);
    return NextResponse.json(
      { error: '記事の削除に失敗しました' },
      { status: 500 }
    );
  }
}