# AquaGuardian Deployment Guide

## 🚀 Quick Deployment Checklist

### Phase 1: Critical Infrastructure (Required)

#### 1. Supabase Database Setup
```bash
# 1. Create Supabase project at https://supabase.com
# 2. Get your project URL and anon key
# 3. Add to environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Run database migrations
npx supabase db push
```

#### 2. Environment Variables Configuration
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your actual values
nano .env
```

#### 3. Netlify Deployment
```bash
# 1. Build the application
npm run build

# 2. Deploy to Netlify
# Option A: Drag & drop dist/ folder to Netlify
# Option B: Connect GitHub repository

# 3. Configure environment variables in Netlify dashboard
# Settings > Environment variables
```

### Phase 2: Revenue & Professional Setup (Optional)

#### 4. RevenueCat Subscription Setup
```bash
# 1. Create RevenueCat account at https://app.revenuecat.com
# 2. Create new project
# 3. Configure web platform
# 4. Create subscription products:
#    - pro_monthly: $9/month
# 5. Add API key to environment
VITE_REVENUECAT_API_KEY=your-revenuecat-key
```

#### 5. Custom Domain Configuration
```bash
# 1. Register domain: aquaguardian.green
# 2. Configure DNS records:
#    Type: CNAME, Name: @, Value: your-netlify-site.netlify.app
#    Type: CNAME, Name: www, Value: your-netlify-site.netlify.app
# 3. Add custom domain in Netlify dashboard
# 4. Enable SSL certificate (automatic)
```

### Phase 3: Advanced Features (Optional)

#### 6. Algorand Blockchain Integration
```bash
# Add Algorand configuration
VITE_ALGORAND_NODE_URL=https://testnet-api.algonode.cloud
VITE_ALGORAND_INDEXER_URL=https://testnet-idx.algonode.cloud
VITE_ALGORAND_NETWORK=testnet

# For mainnet deployment:
# VITE_ALGORAND_NODE_URL=https://mainnet-api.algonode.cloud
# VITE_ALGORAND_INDEXER_URL=https://mainnet-idx.algonode.cloud
# VITE_ALGORAND_NETWORK=mainnet
```

#### 7. ElevenLabs Voice-over (Video Production)
```bash
# Add ElevenLabs API key for video generation
ELEVEN_API_KEY=your-elevenlabs-key

# Install FFmpeg for video production
# macOS: brew install ffmpeg
# Ubuntu: sudo apt install ffmpeg
```

## 🔧 Detailed Setup Instructions

### Supabase Database Setup

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and region
   - Set database password

2. **Configure Database**
   ```sql
   -- Run these commands in Supabase SQL editor
   -- (Already included in migrations)
   
   -- Enable RLS
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
   ```

3. **Get Credentials**
   - Project URL: Settings > API > Project URL
   - Anon Key: Settings > API > Project API keys > anon public

### RevenueCat Setup

1. **Create Account**
   - Sign up at [app.revenuecat.com](https://app.revenuecat.com)
   - Create new project

2. **Configure Products**
   ```json
   {
     "identifier": "pro_monthly",
     "type": "subscription",
     "price": "$9.00",
     "period": "1 month",
     "trial_period": "7 days"
   }
   ```

3. **Web Platform Setup**
   - Add web platform in RevenueCat dashboard
   - Configure webhook endpoints
   - Get API key from Settings > API Keys

### Netlify Deployment

1. **Build Configuration**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "20"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Environment Variables**
   - Go to Site settings > Environment variables
   - Add all required variables from .env.example

3. **Custom Domain**
   - Domain settings > Add custom domain
   - Follow DNS configuration instructions
   - SSL certificate will be provisioned automatically

## 🧪 Testing Deployment

### 1. Database Connection Test
```bash
# Test Supabase connection
curl -X GET 'https://your-project.supabase.co/rest/v1/users' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

### 2. Subscription Test
```bash
# Test RevenueCat connection
curl -X GET 'https://api.revenuecat.com/v1/subscribers/test-user' \
  -H "Authorization: Bearer your-api-key"
```

### 3. End-to-End Test
```bash
# Run full test suite
npm run qa:full
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check environment variables
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   
   # Verify RLS policies
   # Check Supabase logs in dashboard
   ```

2. **Subscription Not Working**
   ```bash
   # Verify RevenueCat configuration
   # Check webhook endpoints
   # Test with RevenueCat sandbox
   ```

3. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. **Custom Domain Issues**
   ```bash
   # Check DNS propagation
   dig aquaguardian.green
   
   # Verify SSL certificate
   curl -I https://aquaguardian.green
   ```

## 📊 Monitoring & Maintenance

### 1. Health Checks
```bash
# Database health
curl https://your-project.supabase.co/rest/v1/

# Application health
curl https://aquaguardian.green/api/health

# Subscription service
curl https://api.revenuecat.com/v1/health
```

### 2. Performance Monitoring
- Netlify Analytics: Built-in performance metrics
- Supabase Dashboard: Database performance
- RevenueCat Dashboard: Subscription metrics

### 3. Error Tracking
- Browser Console: Client-side errors
- Netlify Functions: Server-side logs
- Supabase Logs: Database errors

## 🔐 Security Considerations

### 1. Environment Variables
- Never commit .env files to version control
- Use different keys for development/production
- Rotate API keys regularly

### 2. Database Security
- RLS policies are enabled by default
- Regular security audits
- Monitor access logs

### 3. Payment Security
- RevenueCat handles PCI compliance
- Use webhook validation
- Monitor for fraudulent activity

## 📈 Scaling Considerations

### 1. Database Scaling
- Supabase auto-scales to 500 concurrent connections
- Consider read replicas for high traffic
- Monitor query performance

### 2. CDN & Caching
- Netlify provides global CDN
- Configure cache headers for static assets
- Use service workers for offline functionality

### 3. Cost Optimization
- Monitor Supabase usage
- Optimize database queries
- Use appropriate RevenueCat pricing tier

## 🎯 Success Metrics

### Technical Metrics
- ✅ Database uptime: 99.9%
- ✅ Page load time: <3 seconds
- ✅ Lighthouse score: >90
- ✅ Error rate: <1%

### Business Metrics
- 📈 User registrations: 100+/month
- 💰 Subscription conversion: >5%
- 🎨 Designs created: 1000+
- 🪙 Token transactions: 50+

---

**Need Help?** 
- 📧 Email: support@aquaguardian.green
- 📚 Documentation: [docs.aquaguardian.green](https://docs.aquaguardian.green)
- 🐛 Issues: [GitHub Issues](https://github.com/aquaguardian/platform/issues)