import { NextRequest, NextResponse } from 'next/server';
import { ArticleModel } from '@/models/article';
import { datastore } from '@/lib/datastore/client';
import { TreeModel } from '@/models/tree';

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
    return NextResponse.json(article);
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
  const transaction = datastore.transaction();

  try {
    await transaction.run();

    const body = await request.json();
    const articleId = (await params).id;

    // 1. 記事の更新
    const articleKey = datastore.key(['Article', articleId]);
    transaction.save({
      key: articleKey,
      data: {
        ...body,
        updatedAt: new Date()
      }
    });

    // 2. タイトルが変更された場合、ツリー構造も更新
    if (body.title) {
      const currentTree = await TreeModel.get();
      const updatedTree = TreeModel.updateTitle(articleId, body.title, currentTree);
      console.log('updatedTree', updatedTree);
      transaction.save({
        key: datastore.key(['System', 'tree']),
        data: updatedTree
      });
    }

    // トランザクションをコミット
    await transaction.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    await transaction.rollback();
    console.error('記事の更新に失敗:', error);
    return NextResponse.json(
      { error: '記事の更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const transaction = datastore.transaction();

  try {
    await transaction.run();

    // 1. 記事の存在確認
    const articleKey = datastore.key(['Article', parseInt((await params).id)]);
    const [article] = await transaction.get(articleKey);

    if (!article) {
      return NextResponse.json(
        { error: '記事が見つかりません' },
        { status: 404 }
      );
    }

    // 2. 現在のツリー構造を取得
    const currentTree = await TreeModel.get();

    // 3. 削除対象の記事IDを全て取得（配下のページも含む）
    const idsToDelete = TreeModel.getSubtreeIds((await params).id, currentTree);

    // 4. 全ての対象記事を削除
    const keysToDelete = idsToDelete.map(id => 
      datastore.key(['Article', datastore.int(id)])
    );
    transaction.delete(keysToDelete);

    // 5. ツリー構造から記事を削除
    const updatedTree = await TreeModel.removeSubtree((await params).id, currentTree);

    // 6. 更新されたツリーを保存
    transaction.save({
      key: datastore.key(['System', 'tree']),
      data: updatedTree
    });

    // 7. トランザクションをコミット
    await transaction.commit();

    return NextResponse.json({ 
      success: true,
      deletedIds: idsToDelete 
    });

  } catch (error) {
    await transaction.rollback();
    console.error('記事削除エラー:', error);
    return NextResponse.json(
      { error: '記事の削除に失敗しました' },
      { status: 500 }
    );
  }
}