// ツリー構造の型定義
export const ROOT_NODE_ID = "root";
export interface TreeNode {
  id: string;          // 記事ID
  title: string;       // 記事タイトル
  children: TreeNode[];
}

export interface TreeStructure {
  version: number;     // 更新バージョン管理用
  updatedAt: string;   // 最終更新日時
  tree: TreeNode[];    // ルートレベルのノード配列
}