import { NextResponse } from 'next/server';
import { TreeModel } from '@/models/tree';

export async function GET() {
  try {
    const tree = await TreeModel.get();
    return NextResponse.json(tree);
  } catch (error) {
    console.error('Failed to fetch tree:', error);
    return NextResponse.json({ error: 'ツリーの取得に失敗しました' }, { status: 500 });
  }
}
