# Daily Progress Report API Server

A Node.js Express server with MongoDB integration for the Daily Progress Report application.

## Prerequisites

- **Node.js** v16+
- **MongoDB** running locally or connection to MongoDB Atlas
- **npm** or **yarn**

## Setup Instructions

### 1. Install Dependencies

From the `server` directory:

```bash
npm install
```

### 2. Configure Environment

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/daily-progress-tracker
PORT=3000
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running locally:

```bash
# macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

### 4. Seed Database (Optional)

Populate with sample data:

```bash
npm run seed
```

### 5. Start Server

```bash
npm start
```

The server will start on http://localhost:3000

## API Endpoints

### Health Check

- `GET /api/ping` - Server status and MongoDB connection

### Dashboard

- `GET /api/dashboard` - Get dashboard data (targets, achievements, stats)
- `POST /api/targets/:id/toggle` - Toggle target completion

### Goals

- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create new goal
- `PATCH /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/:id/toggle` - Toggle goal active status

### Analytics

- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/weekly` - Get weekly data
- `GET /api/analytics/monthly` - Get monthly trends

### Calendar

- `GET /api/calendar` - Get calendar data
- `GET /api/calendar/day/:date` - Get specific day data
- `POST /api/calendar/day/:date/reflection` - Save daily reflection

## Testing the API

```bash
# Test server status
curl http://localhost:3000/api/ping

# Test dashboard
curl http://localhost:3000/api/dashboard

# Test goals
curl http://localhost:3000/api/goals
```

## Development

- **Logs**: The server will log MongoDB connection status and API usage
- **Fallback**: If MongoDB is not available, the server uses fallback data
- **Hot Reload**: Restart the server to see changes

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a proper MongoDB connection string
3. Configure reverse proxy (nginx) if needed
4. Use PM2 or similar process manager

```bash
npm install -g pm2
pm2 start server.js --name "dpr-api"
```

## Troubleshooting

### MongoDB Connection Issues

1. **Check MongoDB is running**: `brew services list | grep mongodb`
2. **Check connection string**: Verify `MONGODB_URI` in `.env`
3. **Check logs**: Server will show connection status on startup

### Port Already in Use

Change the port in `.env`:

```env
PORT=3001
```

### Module Import Errors

Make sure all dependencies are installed:

```bash
npm install
```
