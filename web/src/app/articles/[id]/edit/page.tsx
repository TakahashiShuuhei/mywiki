"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Typography
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

export default function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${id}`);
        if (!response.ok) {
          throw new Error('記事の取得に失敗しました');
        }
        const data = await response.json();
        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : '記事の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('記事の保存に失敗しました');
      }

      router.push(`/articles/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '記事の保存に失敗しました');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/articles/${id}`);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 100px)', // AppBarとパディングを考慮
      gap: 2,
      p: 2 
    }}>
      <TextField
        label="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <TextField
        label="本文"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        multiline
        fullWidth
        variant="outlined"
        sx={{ 
          flex: 1,
          '& .MuiInputBase-root': {
            height: '100%',
          },
          '& .MuiInputBase-input': {
            height: '100% !important',
            overflow: 'auto !important',
          },
        }}
      />

      <Stack 
        direction="row" 
        spacing={2} 
        justifyContent="flex-end"
        sx={{ mt: 2 }}
      >
        <Button
          variant="outlined"
          onClick={handleCancel}
          startIcon={<CancelIcon />}
          disabled={isSaving}
        >
          キャンセル
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<SaveIcon />}
          disabled={isSaving}
        >
          保存
        </Button>
      </Stack>
    </Box>
  );
}