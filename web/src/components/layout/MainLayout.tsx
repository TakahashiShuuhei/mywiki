'use client';

import { useState } from 'react';
import { IconButton, Box, AppBar, Toolbar, Typography, Drawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchBar from '@/components/common/SearchBar';
import SideNav from '@/components/nav/SideNav';

const DRAWER_WIDTH = 280;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* ヘッダー */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: 2000,
          backgroundColor: 'background.paper',  // 白背景
          color: 'text.primary',               // テキストを通常の色に
          boxShadow: 1                         // より軽いシャドウ
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div">
            MyWiki
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SearchBar />
            <IconButton color="inherit" href="/settings">
              <SettingsIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* サイドナビゲーション */}
      <Drawer
        variant="persistent"
        open={isDrawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: '64px', // AppBarの高さ
            height: 'calc(100% - 64px)',
          },
        }}
      >
        <SideNav />
      </Drawer>

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',
          ml: isDrawerOpen ? `${DRAWER_WIDTH}px` : 0,
          transition: theme => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}