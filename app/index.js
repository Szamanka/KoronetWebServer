const express = require('express');
const { Pool } = require('pg'); // Use Pool instead of Client for better connection management
const redis = require('redis');

const app = express();
const port = process.env.PORT || 3000;

// Add basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check tracking
let isHealthy = {
  server: true,
  postgres: false,
  redis: false
};

// --- PostgreSQL Connection Pool ---
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'postgres', // Changed from localhost for container networking
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'koronet_db',
  // Pool configuration
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pgPool = new Pool(dbConfig);

// Handle pool errors
pgPool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
  isHealthy.postgres = false;
});

async function connectToPostgres() {
  let retries = 5;
  const retryDelay = 5000; // 5 seconds

  while (retries > 0) {
    try {
      const client = await pgPool.connect();
      const res = await client.query('SELECT NOW()');
      console.log('Connected to PostgreSQL database');
      console.log('PostgreSQL current time:', res.rows[0].now);
      client.release();
      isHealthy.postgres = true;
      return;
    } catch (err) {
      console.error(`Error connecting to PostgreSQL (${retries} retries left):`, err.message);
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  isHealthy.postgres = false;
}

// --- Redis Connection ---
const redisUrl = process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || '6379'}`;

const redisClient = redis.createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis: Too many reconnection attempts');
        return new Error('Too many reconnection attempts');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on('connect', () => {
  console.log('Connected to Redis!');
  isHealthy.redis = true;
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err.message);
  isHealthy.redis = false;
});

async function connectToRedis() {
  let retries = 5;
  const retryDelay = 5000; // 5 seconds

  while (retries > 0) {
    try {
      await redisClient.connect();
      await redisClient.set('koronet:message', 'Hello from Redis!');
      const message = await redisClient.get('koronet:message');
      console.log('Message from Redis:', message);
      isHealthy.redis = true;
      return;
    } catch (err) {
      console.error(`Error connecting to Redis (${retries} retries left):`, err.message);
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  isHealthy.redis = false;
}

// --- Web Server Routes ---
app.get('/', (req, res) => {
  res.json({
    message: 'Hi Koronet Team.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint for container orchestration
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: isHealthy.server && isHealthy.postgres && isHealthy.redis ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      server: isHealthy.server ? 'up' : 'down',
      postgres: isHealthy.postgres ? 'up' : 'down',
      redis: isHealthy.redis ? 'up' : 'down'
    },
    uptime: process.uptime()
  };

  const httpStatus = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(httpStatus).json(healthCheck);
});

// Readiness check endpoint
app.get('/ready', (req, res) => {
  const isReady = isHealthy.postgres && isHealthy.redis;
  if (isReady) {
    res.status(200).json({ ready: true, timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ ready: false, timestamp: new Date().toISOString() });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// --- Start Server and Connect to Services ---
const server = app.listen(port, () => {
  console.log(`Web server listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Initialize connections
  connectToPostgres();
  connectToRedis();
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} signal received: starting graceful shutdown`);

  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed');
  });

  try {
    // Close database connections
    if (pgPool) {
      await pgPool.end();
      console.log('PostgreSQL pool closed');
    }

    // Close Redis connection
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      console.log('Redis connection closed');
    }

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app; // Export for testing