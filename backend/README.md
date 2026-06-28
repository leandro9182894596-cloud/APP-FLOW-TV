# Flow TV Backend

Backend API for Flow TV application.

## Tech Stack

- Node.js 22
- Express.js
- Prisma ORM
- MySQL 8
- JWT Authentication
- PM2 (process manager)
- Nginx (reverse proxy)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Generate Prisma Client:

```bash
npm run db:generate
```

4. Run migrations:

```bash
npm run db:migrate
```

5. Start the server:

```bash
npm run dev
# or for production
npm start
```

## Docker

To run with Docker:

```bash
docker-compose up -d
```

## PM2

To run with PM2:

```bash
pm2 start ecosystem.config.js
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dns` - Get DNS connections
- `POST /api/users/dns` - Create DNS connection
- `PUT /api/users/dns/:id` - Update DNS connection
- `DELETE /api/users/dns/:id` - Delete DNS connection

### Favorites

- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:contentType/:contentId` - Remove from favorites

### History

- `GET /api/history` - Get watch history
- `POST /api/history` - Add/Update watch history
- `DELETE /api/history/:contentType/:contentId` - Remove history item
- `DELETE /api/history` - Clear all history

### Settings

- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

### Ads

- `GET /api/ads` - Get active ads

### Admin

- `GET /api/admin/config` - Get app configuration (public)
- `POST /api/admin/verify-password` - Verify admin password
- `POST /api/admin/config` - Save app configuration
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/admins` - Create new admin
- `POST /api/admin/ads` - Create ad (admin only)
- `PUT /api/admin/ads/:id` - Update ad (admin only)
- `DELETE /api/admin/ads/:id` - Delete ad (admin only)
