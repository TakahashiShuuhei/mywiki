import { NextRequest, NextResponse } from 'next/server';
import { datastore } from '@/lib/datastore/client';
import { TreeModel } from '@/models/tree';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const transaction = datastore.transaction();

  try {
    await transaction.run();

    const { newParentId, index } = await request.json();
    const articleId = (await params).id;

    // 現在のツリー構造を取得
    const currentTree = await TreeModel.get();

    // ツリー構造を更新
    const updatedTree = await TreeModel.moveNode(articleId, newParentId, currentTree, index);

    // 更新されたツリーを保存
    transaction.save({
      key: datastore.key(['System', 'tree']),
      data: updatedTree,
    });

    await transaction.commit();

    return NextResponse.json(updatedTree);
  } catch (error) {
    await transaction.rollback();
    console.error('記事の移動に失敗:', error);
    return NextResponse.json({ error: '記事の移動に失敗しました' }, { status: 500 });
  }
}
