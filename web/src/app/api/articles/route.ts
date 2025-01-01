import { NextResponse } from 'next/server';
import { ArticleModel } from '@/models/article';

export async function GET() {
  try {
    const articles = await ArticleModel.list();
    return NextResponse.json({ data: articles });
  } catch (error) {
    console.error('記事一覧の取得に失敗:', error);
    return NextResponse.json(
      { error: '記事一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await ArticleModel.create(body);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('記事の作成に失敗:', error);
    return NextResponse.json(
      { error: '記事の作成に失敗しました' },
      { status: 500 }
    );
  }
}