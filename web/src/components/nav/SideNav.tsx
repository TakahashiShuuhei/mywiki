import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import { Box, Typography } from '@mui/material';

// 記事ツリーの型定義
type ArticleNode = {
  id: string;
  label: string;
  children?: ArticleNode[];
};

// テスト用のデータ
const ITEMS: ArticleNode[] = [
  {
    id: '1',
    label: '開発',
    children: [
      {
        id: '2',
        label: 'フロントエンド',
      },
      {
        id: '3',
        label: 'バックエンド',
      },
    ],
  },
  {
    id: '4',
    label: 'インフラ',
    children: [
      {
        id: '5',
        label: 'GCP',
      },
    ],
  },
];

export default function SideNav() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        記事一覧
      </Typography>
      <RichTreeView
        aria-label="記事ナビゲーション"
        items={ITEMS}
        slots={{
          item: TreeItem2,
        }}
      />
    </Box>
  );
}