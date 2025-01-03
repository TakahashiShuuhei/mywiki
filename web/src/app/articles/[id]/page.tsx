'use client';

import { useEffect, useState } from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

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
      </Stack>

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

        <Divider sx={{ my: 3 }} />

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
