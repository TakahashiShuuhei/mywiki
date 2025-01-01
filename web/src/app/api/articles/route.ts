import { NextResponse } from 'next/server';
import { datastoreClient } from '@/lib/datastore';

export async function GET() {
  try {
    console.log('get articles');
    const articles = await datastoreClient.listArticles();
    console.log('articles', articles);
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
    const result = await datastoreClient.createArticle(body);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('記事の作成に失敗:', error);
    return NextResponse.json(
      { error: '記事の作成に失敗しました' },
      { status: 500 }
    );
  }
}