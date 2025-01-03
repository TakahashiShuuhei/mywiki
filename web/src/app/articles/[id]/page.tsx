"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  CircularProgress,
  IconButton,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

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
      <Typography>{article.content}</Typography>
    </Box>
  );
}