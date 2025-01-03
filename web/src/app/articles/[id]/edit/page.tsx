'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Box, TextField, Button, Stack, CircularProgress, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { triggerTreeUpdate } from '@/events/treeEvents';

export default function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

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

      triggerTreeUpdate();

      router.push(`/articles/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '記事の保存に失敗しました');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/articles/${id}`);
  };

  // テキストを挿入する関数
  const insertText = (textToInsert: string) => {
    const textarea = textFieldRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newContent = content.substring(0, start) + textToInsert + content.substring(end);

    setContent(newContent);

    // カーソル位置を挿入したテキストの後ろに移動
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
      textarea.focus();
    }, 0);
  };

  // ドラッグ&ドロップ関連のハンドラー
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/articles/${id}/files`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('ファイルのアップロードに失敗しました');
        }

        const result = await response.json();

        // ファイルタイプに応じてマークダウン記法を変更
        let markdownText = '';
        if (file.type.startsWith('image/')) {
          markdownText = `\n![${file.name}](${result.url})\n`;
        } else {
          markdownText = `\n[${file.name}](${result.url})\n`;
        }

        insertText(markdownText);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      setError(error instanceof Error ? error.message : 'ファイルのアップロードに失敗しました');
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 100px)',
        gap: 2,
        p: 2,
        position: 'relative',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ドラッグ中のオーバーレイ */}
      {isDragging && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 1,
          }}
        >
          ファイルをドロップしてアップロード
        </Box>
      )}

      <TextField
        label="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <TextField
        inputRef={textFieldRef}
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

      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
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
