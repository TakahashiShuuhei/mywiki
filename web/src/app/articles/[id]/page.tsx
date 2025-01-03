"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  CircularProgress,
  IconButton,
  Stack,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface Article {
  id: string;
  title: string;
  content: string;
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${(await params).id}`);
        if (!response.ok) {
          throw new Error('記事の取得に失敗しました');
        }
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '記事の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
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

  return (
    <Box sx={{ p: 2 }}>
      <Stack 
        direction="row" 
        alignItems="center" 
        spacing={1} 
        sx={{ mb: 2 }}
      >
        <Typography variant="h4" component="h1">
          {article.title}
        </Typography>
        <IconButton 
          onClick={handleEditClick}
          aria-label="記事を編集"
          size="small"
        >
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
            height: 'auto'
          },
          '& pre': {
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            backgroundColor: 'grey.100'
          },
          '& code': {
            fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
            fontSize: '0.875rem'
          },
          '& table': {
            borderCollapse: 'collapse',
            width: '100%',
            mb: 2
          },
          '& th, & td': {
            border: '1px solid',
            borderColor: 'grey.300',
            p: 1
          },
          '& blockquote': {
            borderLeft: 4,
            borderColor: 'grey.300',
            pl: 2,
            ml: 0,
            my: 2
          }
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            rehypeSanitize,
            rehypeHighlight
          ]}
          components={{
            h1: ({ ...props }) => (
              <Typography variant="h4" gutterBottom {...props} />
            ),
            h2: ({ ...props }) => (
              <Typography variant="h5" gutterBottom {...props} />
            ),
            h3: ({ ...props }) => (
              <Typography variant="h6" gutterBottom {...props} />
            ),
            p: ({ ...props }) => (
              <Typography paragraph {...props} />
            ),
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
      </Paper>
    </Box>
  );
}