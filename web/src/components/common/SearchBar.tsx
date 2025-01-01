"use client";

import { InputBase, Box, alpha } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar() {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 1,
        backgroundColor: theme => alpha(theme.palette.grey[200], 0.5),
        '&:hover': {
          backgroundColor: theme => alpha(theme.palette.grey[200], 0.8),
        },
        width: '100%',
        maxWidth: 400,
      }}
    >
      <Box sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
        <SearchIcon sx={{ ml: 1, color: 'text.secondary' }} />
        <InputBase
          placeholder="記事を検索..."
          sx={{
            ml: 1,
            flex: 1,
            '& .MuiInputBase-input': {
              p: 1,
              color: 'text.primary',
            },
          }}
        />
      </Box>
    </Box>
  );
}