import { NextResponse } from 'next/server';
import { datastore } from '@/lib/datastore/client';
import { ArticleModel } from '@/models/article';
import { TreeModel } from '@/models/tree';

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
  const transaction = datastore.transaction();

  try {
    await transaction.run();

    // 1. リクエストボディを取得
    const { title = '新規記事', parentId = null } = await request.json();

    // 2. 記事を作成
    const articleKey = datastore.key(['Article']);
    const article = {
      title,
      content: '',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    transaction.save({
      key: articleKey,
      data: article
    });

    // 3. 現在のツリー構造を取得
    const currentTree = await TreeModel.get();

    // 4. ツリー構造を更新
    const updatedTree = await TreeModel.addChild(
      parentId,
      articleKey.id as string,
      title,
      currentTree
    );

    // 5. 更新されたツリーを保存
    transaction.save({
      key: datastore.key(['System', 'tree']),
      data: updatedTree
    });

    // 6. トランザクションをコミット
    await transaction.commit();

    // 7. レスポンスを返す
    return NextResponse.json({
      article: {
        id: articleKey.id,
        ...article
      },
      tree: updatedTree
    });

  } catch (error) {
    await transaction.rollback();
    console.error('記事作成エラー:', error);
    return NextResponse.json(
      { error: '記事の作成に失敗しました' },
      { status: 500 }
    );
  }
}