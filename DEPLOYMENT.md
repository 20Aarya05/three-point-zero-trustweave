# TrustWeave Backend Deployment Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Supabase** account and project
4. **Your TrustWeave agents** implemented as modules

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# API Configuration
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Run the SQL script

### 4. Agent Integration

Replace the placeholder implementations in `src/agents/index.ts`:

```typescript
import { YourPurposeRoutingAgent } from './your-agents/purposeRoutingAgent';
import { YourDataInterpretationAgent } from './your-agents/dataInterpretationAgent';
// ... import other agents

export class AgentFactory {
  static createPurposeRoutingAgent(): PurposeRoutingAgent {
    return new YourPurposeRoutingAgent();
  }
  
  static createDataInterpretationAgent(): DataInterpretationAgent {
    return new YourDataInterpretationAgent();
  }
  
  // ... implement other agent factories
}
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Production Deployment

### Option 1: Vercel (Recommended for Node.js)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   - Go to Vercel dashboard
   - Navigate to your project settings
   - Add all environment variables from `.env`

### Option 2: Railway

1. **Connect your repository to Railway**
2. **Set environment variables** in Railway dashboard
3. **Deploy automatically** on git push

### Option 3: Heroku

1. **Create Heroku app**
   ```bash
   heroku create your-trustweave-api
   ```

2. **Set environment variables**
   ```bash
   heroku config:set SUPABASE_URL=your_url
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_key
   # ... set other variables
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 4: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3001
   
   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t trustweave-api .
   docker run -p 3001:3001 --env-file .env trustweave-api
   ```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3001 |
| `NODE_ENV` | Environment | No | development |
| `SUPABASE_URL` | Supabase project URL | Yes | - |
| `SUPABASE_ANON_KEY` | Supabase anon key | Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes | - |
| `CORS_ORIGIN` | Allowed CORS origin | No | http://localhost:3000 |
| `API_VERSION` | API version | No | v1 |

## Health Checks

The API provides several health check endpoints:

- `GET /health` - Overall system health
- `GET /api/evaluate/health` - Evaluation service health

Use these for monitoring and load balancer health checks.

## Monitoring and Logging

### Production Logging

Consider adding structured logging:

```bash
npm install winston
```

### Error Tracking

Consider integrating error tracking:

```bash
npm install @sentry/node
```

### Performance Monitoring

Monitor API performance with tools like:
- New Relic
- DataDog
- Application Insights

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Configure appropriate origins for production
3. **Rate Limiting**: Adjust rate limits based on expected traffic
4. **HTTPS**: Always use HTTPS in production
5. **Database**: Use service role key securely, consider row-level security

## Scaling Considerations

1. **Horizontal Scaling**: The API is stateless and can be scaled horizontally
2. **Database**: Monitor Supabase usage and upgrade plan as needed
3. **Caching**: Consider adding Redis for caching frequent evaluations
4. **Load Balancing**: Use a load balancer for multiple instances

## Troubleshooting

### Common Issues

1. **Agent Not Implemented Error**
   - Ensure all agents are properly imported in `src/agents/index.ts`
   - Check that agent classes implement the required interfaces

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check if database schema is properly set up
   - Ensure service role key has necessary permissions

3. **CORS Issues**
   - Update `CORS_ORIGIN` environment variable
   - Check that frontend is making requests to correct API URL

4. **Rate Limiting**
   - Adjust rate limits in `src/server.ts` if needed
   - Consider implementing user-based rate limiting

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development npm run dev
```

### Testing

Run tests to verify setup:

```bash
npm test
```

## Support

For issues related to:
- **API Integration**: Check this documentation and examples
- **Agent Implementation**: Refer to your agent documentation
- **Database Issues**: Check Supabase documentation
- **Deployment**: Refer to your platform's documentation