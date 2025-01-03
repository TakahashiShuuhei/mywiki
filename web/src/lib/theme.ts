'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';
import { blue, grey } from '@mui/material/colors';

declare module '@mui/material/styles' {
  interface Components {
    MuiTreeItem: {
      styleOverrides?: {
        root?: {
          '& .MuiTreeItem-content': {
            padding?: string;
            borderRadius?: number;
            '&:hover'?: {
              backgroundColor?: string;
            };
          };
        };
      };
    };
  }
}

// カスタムカラーパレットの定義
const palette = {
  primary: {
    main: blue[700],
    light: blue[400],
    dark: blue[900],
  },
  background: {
    default: '#ffffff',
    paper: grey[50],
  },
};

// 日本語フォントの設定
const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    '"Hiragino Sans"',
    '"Hiragino Kaku Gothic ProN"',
    '"Yu Gothic UI"',
    'Meiryo',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2rem',
    fontWeight: 600,
  },
  h2: {
    fontSize: '1.75rem',
    fontWeight: 600,
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  h5: {
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.75,
  },
};

// コンポーネント固有のスタイル設定
const components: ThemeOptions['components'] = {
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: blue[700],
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: grey[50],
        borderRight: `1px solid ${grey[200]}`,
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        textTransform: 'none',
      },
    },
  },
  MuiTreeItem: {
    styleOverrides: {
      root: {
        '& .MuiTreeItem-content': {
          padding: '4px 8px',
          borderRadius: 8,
          '&:hover': {
            backgroundColor: grey[100],
          },
        },
      },
    },
  },
};

// テーマの作成
const theme = createTheme({
  palette,
  typography,
  components,
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
});

export default theme;
