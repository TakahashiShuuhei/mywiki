"use client";

import { forwardRef, useState, MouseEvent } from 'react';
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
  const items = [
    {
      id: '1',
      label: 'フロントエンド',
      children: [
        {
          id: '2',
          label: 'React',
          children: []
        },
        {
          id: '3',
          label: 'Next.js',
          children: []
        }
      ]
    },
    {
      id: '4',
      label: 'バックエンド',
      children: []
    }
  ];

  return (
    <RichTreeView
      items={items}
      slots={{ item: CustomTreeItem }}
      sx={{ flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
    />
  );
}