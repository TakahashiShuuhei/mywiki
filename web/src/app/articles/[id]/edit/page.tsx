"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  TextField, 
  Button, 
  CircularProgress,
  Stack,
  Typography 
} from '@mui/material';

interface Article {
  id: string;
  title: string;
  content: string;
}

export default function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!article) return;

    try {
      const response = await fetch(`/api/articles/${(await params).id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      });

      if (!response.ok) {
        throw new Error('記事の更新に失敗しました');
      }

      router.push(`/articles/${(await params).id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '記事の更新に失敗しました');
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

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Stack spacing={2}>
        <TextField
          label="タイトル"
          value={article.title}
          onChange={(e) => setArticle({ ...article, title: e.target.value })}
          fullWidth
        />
        <TextField
          label="本文"
          value={article.content}
          onChange={(e) => setArticle({ ...article, content: e.target.value })}
          multiline
          rows={10}
          fullWidth
        />
        <Button type="submit" variant="contained">
          保存
        </Button>
      </Stack>
    </Box>
  );
}