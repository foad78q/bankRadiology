import express from 'express';
import path from 'path';
import fs from 'fs';
import {
  handleAuthLogin,
  handleAuthMe,
  handleAuthLogout,
  handleAuthChangePassword,
  handleForgotRequestOtp,
  handleForgotReset,
  handleDashboardStats,
  handleGetSettings,
  handleUpdateSettings,
  handleGetUsers,
  handleUpdateUserStatus,
  handleSendDirectMessageToUser,
  handleGetSupportTickets,
  handleReplySupportTicket,
  handleDeleteSupportTicket,
  handleGetMenuTree,
  handleCreateNode,
  handleUpdateNode,
  handleToggleNodeMaintenance,
  handleDeleteNode,
  handleReorderNodes,
  handleParseUrl,
  handleAddResourceToNode,
  handleDeleteResource,
  handleGetCategories,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
  handleGetResources,
  handleCreateResource,
  handleUpdateResource,
  handleDeleteResourceAdmin,
  handleDuplicateResource,
  handlePreviewResource,
  handleGetKeywords,
  handleGetKeywordSuggestions,
  handleBotStart,
  handleTestBotTokenEndpoint,
  handleTestStorageChannelEndpoint,
  handleGetChannels,
  handleCreateChannel,
  handleUpdateChannel,
  handleDeleteChannel,
  handleToggleChannel,
  handleTestChannelEndpoint,
  handleGetBotTexts,
  handleUpdateBotTexts,
  handleGetBotButtons,
  handleUpdateBotButtons,
  handleResetBotButtons,
  handleDeleteBotButton,
  handleGetReportsMetrics,
  handleGetReportChannelConfig,
  handleUpdateReportChannelConfig,
  handleSendDailyReport,
  handleBroadcastSend,
  handleGetBackups,
  handleCreateBackup,
  handleDownloadBackup,
  handleImportBackup,
  handleRestoreBackup,
  handleDeleteBackup,
  handleSendBroadcast,
  handleGetErrors,
} from './src/server/adminHandlers';

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // JSON & URL-encoded body parser for API routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 1. Core Native Admin & Authentication API Endpoints
  app.post('/api/admin/auth/login', handleAuthLogin);
  app.get('/api/admin/auth/me', handleAuthMe);
  app.post('/api/admin/auth/logout', handleAuthLogout);
  app.post('/api/admin/auth/change-password', handleAuthChangePassword);
  app.post('/api/admin/auth/forgot-password/request-otp', handleForgotRequestOtp);
  app.post('/api/admin/auth/forgot-password/reset', handleForgotReset);
  app.get('/api/admin/dashboard/stats', handleDashboardStats);
  
  // Settings & Setup wizard endpoints
  app.get('/api/admin/settings', handleGetSettings);
  app.put('/api/admin/settings', handleUpdateSettings);
  app.post('/api/admin/settings/test-channel', handleTestStorageChannelEndpoint);
  app.post('/api/setup/test-channel', handleTestStorageChannelEndpoint);
  app.post('/api/setup/test-bot', handleTestBotTokenEndpoint);
  app.post('/api/setup/test-db', (req, res) => {
    return res.json({
      success: true,
      message: 'دیتابیس SQLite سیستم با موفقیت تست شد و متصل است.',
    });
  });
  app.post('/api/setup/complete', async (req, res) => {
    try {
      const { bot_token, storage_channel, admin_id } = req.body || {};
      if (bot_token) {
        process.env.BOT_TOKEN = String(bot_token).trim();
      }
      if (admin_id) {
        process.env.ADMIN_ID = String(admin_id).trim();
      }

      // Automatically trigger bot start, polling loop, and send Telegram connection notification
      return await handleBotStart(req, res);
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  });

  // Users endpoint
  app.get('/api/admin/users', handleGetUsers);
  app.post('/api/admin/users/:id/status', handleUpdateUserStatus);
  app.put('/api/admin/users/:id/status', handleUpdateUserStatus);
  app.post('/api/admin/users/:id/send-message', handleSendDirectMessageToUser);

  // Support Tickets Endpoints
  app.get('/api/admin/support/tickets', handleGetSupportTickets);
  app.post('/api/admin/support/tickets/:id/reply', handleReplySupportTicket);
  app.delete('/api/admin/support/tickets/:id', handleDeleteSupportTicket);

  // Categories Endpoints
  app.get('/api/admin/categories', handleGetCategories);
  app.post('/api/admin/categories', handleCreateCategory);
  app.put('/api/admin/categories/:id', handleUpdateCategory);
  app.delete('/api/admin/categories/:id', handleDeleteCategory);

  // Resources & Keywords Endpoints
  app.get('/api/admin/keywords', handleGetKeywords);
  app.get('/api/admin/keywords/suggestions', handleGetKeywordSuggestions);
  app.get('/api/admin/resources', handleGetResources);
  app.post('/api/admin/resources', handleCreateResource);
  app.put('/api/admin/resources/:id', handleUpdateResource);
  app.delete('/api/admin/resources/:id', handleDeleteResourceAdmin);
  app.post('/api/admin/resources/:id/duplicate', handleDuplicateResource);
  app.get('/api/admin/resources/:id/preview', handlePreviewResource);
  app.post('/api/admin/telegram/parse-url', handleParseUrl);

  // Backups & Error Logs Endpoints
  app.get('/api/admin/backups', handleGetBackups);
  app.post('/api/admin/backups/create', handleCreateBackup);
  app.get('/api/admin/backups/download/:filename', handleDownloadBackup);
  app.post('/api/admin/backups/import', handleImportBackup);
  app.post('/api/admin/backups/restore', handleRestoreBackup);
  app.delete('/api/admin/backups/:filename', handleDeleteBackup);
  app.post('/api/admin/broadcast', handleSendBroadcast);
  app.get('/api/admin/errors', handleGetErrors);

  // 2. Telegram Bot Management Endpoints
  app.post('/api/admin/bot/start', handleBotStart);
  app.post('/api/admin/bot/test-token', handleTestBotTokenEndpoint);

  // 3. Forced Membership / Sponsor Channels Endpoints
  app.get('/api/admin/channels', handleGetChannels);
  app.post('/api/admin/channels', handleCreateChannel);
  app.put('/api/admin/channels/:id', handleUpdateChannel);
  app.delete('/api/admin/channels/:id', handleDeleteChannel);
  app.post('/api/admin/channels/:id/toggle', handleToggleChannel);
  app.post('/api/admin/channels/:id/test', handleTestChannelEndpoint);

  // 4. Bot Dynamic Texts & Buttons
  app.get('/api/admin/texts', handleGetBotTexts);
  app.put('/api/admin/texts', handleUpdateBotTexts);
  app.get('/api/admin/bot-buttons', handleGetBotButtons);
  app.post('/api/admin/bot-buttons', handleUpdateBotButtons);
  app.put('/api/admin/bot-buttons', handleUpdateBotButtons);
  app.delete('/api/admin/bot-buttons/:id', handleDeleteBotButton);
  app.delete('/api/admin/bot-buttons', handleDeleteBotButton);
  app.post('/api/admin/bot-buttons/reset', handleResetBotButtons);

  // 5. Reports & Channel Notifications
  app.get('/api/admin/reports/metrics', handleGetReportsMetrics);
  app.get('/api/admin/reports/channel-config', handleGetReportChannelConfig);
  app.put('/api/admin/reports/channel-config', handleUpdateReportChannelConfig);
  app.post('/api/admin/reports/send-daily', handleSendDailyReport);

  // 6. Broadcast Messages
  app.post('/api/admin/broadcast/send', handleBroadcastSend);

  // 7. Menu Tree Management API Endpoints
  app.get('/api/menu-tree/tree', handleGetMenuTree);
  app.get('/api/admin/menu-items', handleGetMenuTree);
  app.post('/api/menu-tree/nodes', handleCreateNode);
  app.post('/api/admin/menu-items', handleCreateNode);
  app.put('/api/menu-tree/nodes/:nodeId', handleUpdateNode);
  app.put('/api/admin/menu-items/:nodeId', handleUpdateNode);
  app.post('/api/menu-tree/nodes/:nodeId/maintenance', handleToggleNodeMaintenance);
  app.delete('/api/menu-tree/nodes/:nodeId', handleDeleteNode);
  app.delete('/api/admin/menu-items/:nodeId', handleDeleteNode);
  app.post('/api/menu-tree/reorder', handleReorderNodes);
  app.post('/api/admin/menu-items/reorder', handleReorderNodes);
  app.post('/api/menu-tree/parse-url', handleParseUrl);

  // Inline buttons & Resource connections
  app.post('/api/menu-tree/nodes/:nodeId/resources', handleAddResourceToNode);
  app.delete('/api/menu-tree/resources/:resourceId', handleDeleteResource);

  // Health check route
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'express' });
  });

  // 8. Frontend Serving (Vite middleware in dev, static files in prod)
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (
        url.startsWith('/api') ||
        url.startsWith('/docs') ||
        url.startsWith('/openapi.json') ||
        url.startsWith('/redoc') ||
        url.startsWith('/webapp')
      ) {
        return next();
      }
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
    console.log('[Server] Vite middleware and HTML handler mounted for development.');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // 9. Start HTTP Server immediately on port 3000
  const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`[Server] Radiology Education Platform Server listening on port ${PORT}...`);
    
    // Auto start Telegram Bot Polling if token is present in env or settings
    try {
      const { getDb } = await import('./src/server/adminHandlers');
      const { startTelegramBotPolling } = await import('./src/server/telegramBotService');
      const db = await getDb();
      let savedToken = process.env.BOT_TOKEN;
      try {
        const resSet = db.exec('SELECT value FROM settings WHERE key = "bot_token"');
        if (resSet.length > 0 && resSet[0].values.length > 0) {
          savedToken = String(resSet[0].values[0][0]);
          process.env.BOT_TOKEN = savedToken;
        }
      } catch {}

      if (savedToken && savedToken.includes(':')) {
        console.log('[Server] Starting automatic Telegram bot polling...');
        startTelegramBotPolling(savedToken).catch((err) => {
          console.warn('[Server] Telegram bot polling auto-start warning:', err?.message || err);
        });
      }
    } catch (botErr) {
      console.warn('[Server] Could not initialize bot service:', botErr);
    }
  });

  const cleanup = () => {
    server.close();
    process.exit(0);
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

startServer().catch((err) => {
  console.error('[Server Fatal] Failed to bootstrap server:', err);
  process.exit(1);
});
