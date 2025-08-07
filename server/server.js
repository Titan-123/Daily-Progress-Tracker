import { createServer } from './index.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const app = createServer();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
      console.log(`🔗 Test with: curl http://localhost:${PORT}/api/ping`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
