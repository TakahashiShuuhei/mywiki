'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Stack,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Grid,
  Link,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import EditIcon from '@mui/icons-material/Edit';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import { TreeNode } from '@/types/tree';
import { triggerTreeUpdate } from '@/events/treeEvents';

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface AttachedFile {
  name: string;
  url: string;
}

// 移動先選択ダイアログのコンポーネント
function MoveDialog({ 
  open, 
  onClose, 
  onMove, 
  currentId 
}: { 
  open: boolean; 
  onClose: () => void; 
  onMove: (newParentId: string) => Promise<void>;
  currentId: string;
}) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await fetch('/api/tree');
        if (!response.ok) throw new Error('ツリーの取得に失敗しました');
        const data = await response.json();
        setTree(data.tree);
      } catch (error) {
        console.error('Error fetching tree:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchTree();
      setSelectedNodeId(null);
      setIsMoving(false); // ダイアログを開くたびにリセット
    }
  }, [open]);

  const handleSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleMove = async () => {
    if (selectedNodeId) {
      try {
        setIsMoving(true);
        await onMove(selectedNodeId);
        onClose();
      } catch (error) {
        console.error('移動に失敗しました:', error);
        // エラー表示などの処理を追加
      } finally {
        setIsMoving(false);
      }
    }
  };

  // ダイアログを閉じる時の処理
  const handleClose = () => {
    if (!isMoving) {
      onClose();
    }
  };

  // 指定したノードの子孫ノードIDを全て取得する関数
  const getDescendantIds = (nodes: TreeNode[], targetId: string): string[] => {
    const descendants: string[] = [];
    
    const traverse = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.id === targetId) {
          // 対象ノードが見つかったら、その配下のノードIDを全て収集
          const collectIds = (n: TreeNode) => {
            descendants.push(n.id);
            n.children?.forEach(collectIds);
          };
          collectIds(node);
          return true;
        }
        if (node.children && traverse(node.children)) {
          return true;
        }
      }
      return false;
    };

    traverse(nodes);
    return descendants;
  };

  // 移動不可能なノードIDのリストを生成
  const disabledNodeIds = useMemo(() => {
    if (!currentId || !tree.length) return [currentId];
    return getDescendantIds(tree, currentId);
  }, [currentId, tree]);

  const renderTreeItems = (nodes: TreeNode[], level = 0) => {
    return nodes.map((node) => (
      <Box key={node.id}>
        <MenuItem
          onClick={() => handleSelect(node.id)}
          disabled={disabledNodeIds.includes(node.id)}
          selected={node.id === selectedNodeId}
          sx={{ 
            pl: level * 4,
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
            },
            // 移動不可能なノードの視覚的フィードバックを強化
            '&.Mui-disabled': {
              opacity: 0.5,
              backgroundColor: 'action.disabledBackground',
            }
          }}
        >
          <ListItemText 
            primary={node.title}
            secondary={disabledNodeIds.includes(node.id) ? '移動先として選択できません' : undefined}
          />
        </MenuItem>
        {node.children && renderTreeItems(node.children, level + 1)}
      </Box>
    ));
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={isMoving}
    >
      <DialogTitle>移動先を選択</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {renderTreeItems(tree)}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={isMoving}
        >
          キャンセル
        </Button>
        <LoadingButton
          onClick={handleMove}
          disabled={!selectedNodeId}
          loading={isMoving}
          variant="contained"
        >
          移動
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string>('');

  useEffect(() => {
    const fetchId = async () => {
      const { id } = await params;
      setCurrentId(id);
    };
    fetchId();
  }, [params]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 記事データの取得
        const articleResponse = await fetch(`/api/articles/${(await params).id}`);
        if (!articleResponse.ok) {
          throw new Error('記事の取得に失敗しました');
        }
        const articleData = await articleResponse.json();
        setArticle(articleData);

        // 添付ファイルの取得
        const filesResponse = await fetch(`/api/articles/${(await params).id}/files`);
        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          setAttachedFiles(filesData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '記事の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handleEditClick = async () => {
    router.push(`/articles/${(await params).id}/edit`);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleMoveArticle = async (newParentId: string) => {
    try {
      const response = await fetch(`/api/articles/${(await params).id}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newParentId }),
      });

      if (!response.ok) {
        throw new Error('記事の移動に失敗しました');
      }

      // ツリー更新イベントを発火
      triggerTreeUpdate();
    } catch (error) {
      console.error('Error moving article:', error);
      // エラー処理
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!article) {
    return <Typography>記事が見つかりません</Typography>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1">
          {article.title}
        </Typography>
        <IconButton onClick={handleEditClick} aria-label="記事を編集" size="small">
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={handleMenuOpen}
          aria-label="その他の操作"
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      </Stack>

      {/* メニュー */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          setMoveDialogOpen(true);
        }}>
          <ListItemIcon>
            <DriveFileMoveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>移動</ListItemText>
        </MenuItem>
      </Menu>

      {/* 移動ダイアログ */}
      <MoveDialog
        open={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        onMove={handleMoveArticle}
        currentId={currentId}
      />

      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: 'background.default',
          '& img': {
            maxWidth: '100%',
            height: 'auto',
          },
          '& pre': {
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            backgroundColor: 'grey.100',
          },
          '& code': {
            fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
            fontSize: '0.875rem',
          },
          '& table': {
            borderCollapse: 'collapse',
            width: '100%',
            mb: 2,
          },
          '& th, & td': {
            border: '1px solid',
            borderColor: 'grey.300',
            p: 1,
          },
          '& blockquote': {
            borderLeft: 4,
            borderColor: 'grey.300',
            pl: 2,
            ml: 0,
            my: 2,
          },
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
          components={{
            h1: ({ ...props }) => <Typography variant="h4" gutterBottom {...props} />,
            h2: ({ ...props }) => <Typography variant="h5" gutterBottom {...props} />,
            h3: ({ ...props }) => <Typography variant="h6" gutterBottom {...props} />,
            p: ({ ...props }) => <Typography paragraph {...props} />,
            a: ({ ...props }) => (
              <Typography
                component="a"
                color="primary"
                {...props}
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              />
            ),
          }}
        >
          {article.content}
        </ReactMarkdown>

        <Divider sx={{ my: 6 }} />

        {/* メタ情報 */}
        <Grid container spacing={3}>
          {/* 日時情報 */}
          <Grid xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                作成日時
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {formatDate(article.createdAt)}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                更新日時
              </Typography>
              <Typography variant="body1">{formatDate(article.updatedAt)}</Typography>
            </Box>
          </Grid>

          {/* 添付ファイル */}
          <Grid xs={12} md={6}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  添付ファイル
                </Typography>
                {attachedFiles.length > 0 && (
                  <IconButton
                    onClick={() => setExpanded(!expanded)}
                    aria-expanded={expanded}
                    aria-label="添付ファイルを表示"
                    size="small"
                    sx={{
                      ml: 1,
                      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                )}
              </Box>
              <Collapse in={expanded} timeout="auto" unmountOnExit>
                {attachedFiles.length > 0 ? (
                  <List dense disablePadding>
                    {attachedFiles.map((file) => (
                      <ListItem key={file.name} disablePadding>
                        <ListItemIcon>
                          <AttachFileIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>
                          <Link
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="primary"
                            underline="hover"
                          >
                            {file.name}
                          </Link>
                        </ListItemText>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    添付ファイルはありません
                  </Typography>
                )}
              </Collapse>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
