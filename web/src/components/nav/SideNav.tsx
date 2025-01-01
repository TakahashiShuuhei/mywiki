"use client";

import { forwardRef, useState, MouseEvent, useEffect } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import {
  TreeItem2Content,
  TreeItem2Root,
  TreeItem2Props,
  TreeItem2GroupTransition,
  TreeItem2IconContainer,
  TreeItem2Label,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { TreeStructure, TreeNode } from '@/types/tree';

type TreeItemType = {
  id: string;
  label: string;
  children: TreeItemType[];
}
// TreeStructureのデータをRichTreeView用のアイテムに変換
function convertTreeNodesToItems(nodes: TreeNode[]): TreeItemType[] {
  return nodes.map(node => ({
    id: node.id,
    label: node.title,
    children: node.children.length > 0 ? convertTreeNodesToItems(node.children) : []
  }));
}

const CustomTreeItem = forwardRef(function CustomTreeItem(
  { id, itemId, label, disabled, children }: TreeItem2Props,
  ref: React.Ref<HTMLLIElement>,
) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const {
    getRootProps,
    getContentProps,
    getLabelProps,
    getGroupTransitionProps,
    getIconContainerProps,
    status,
  } = useTreeItem2({ id, itemId, label, disabled, children, rootRef: ref });

  const handleMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <TreeItem2Provider itemId={itemId}>
      <TreeItem2Root {...getRootProps()}>
        <TreeItem2Content {...getContentProps()}>
          <TreeItem2IconContainer {...getIconContainerProps()}>
            <TreeItem2Icon status={status} />
          </TreeItem2IconContainer>

          <TreeItem2Label {...getLabelProps()} />

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{ 
                opacity: menuAnchorEl ? 1 : 0,
                '&:hover': { opacity: 1 },
                '.MuiTreeItem-content:hover &': { opacity: 1 }
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => {
                console.log('Add page under:', itemId);
                handleMenuClose();
              }}>
                <ListItemIcon>
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>ページを追加</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => {
                console.log('Delete page:', itemId);
                handleMenuClose();
              }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>ページを削除</ListItemText>
              </MenuItem>
            </Menu>
          </Stack>
        </TreeItem2Content>
        {children && <TreeItem2GroupTransition {...getGroupTransitionProps()} />}
      </TreeItem2Root>
    </TreeItem2Provider>
  );
});

export default function SideNav() {
  const [treeItems, setTreeItems] = useState<TreeItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await fetch('/api/tree');
        if (!response.ok) {
          throw new Error('Failed to fetch tree');
        }
        const treeData: TreeStructure = await response.json();
        const items = convertTreeNodesToItems(treeData.tree);
        setTreeItems(items);
      } catch (err) {
        console.error('Failed to fetch tree:', err);
        setError('ツリーの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTree();
  }, []);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  return (
    <RichTreeView
      items={treeItems}
      slots={{ item: CustomTreeItem }}
      defaultExpandedItems={['root']}
      sx={{ flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
    />
  );
}