# AquaGuardian

A comprehensive aquaponic system design and simulation platform with blockchain tokenization capabilities.

## Features

### 🌱 Core Functionality
- **Interactive Design Wizard**: Step-by-step aquaponic system configuration
- **Real-time Simulation**: Advanced performance modeling with yield predictions
- **Performance Analytics**: 30-day cumulative charts and efficiency metrics
- **Design Marketplace**: Community sharing and discovery platform

### 💎 Pro Designer Subscription ($9/month)
- **Unlimited Simulations**: No restrictions on system designs
- **Advanced Analytics**: Detailed performance insights and comparisons
- **Token Minting**: Unlimited blockchain asset creation
- **Priority Support**: Dedicated customer assistance
- **Export Features**: Detailed PDF reports and data export

### 🔗 Blockchain Integration
- **Asset Tokenization**: Convert aquaponic systems into tradeable digital assets
- **Algorand Network**: Carbon-negative blockchain for sustainable tokenization
- **Fractional Ownership**: Enable community-supported agriculture models
- **Performance-Based Value**: Token value tied to actual system metrics

### 🎨 Design System
- **Figma-Inspired UI**: Emerald/teal color palette with rounded-2xl cards
- **Responsive Navigation**: Adaptive sidebar with mobile optimization
- **Framer Motion**: Smooth animations and micro-interactions
- **Dark Mode**: System-aware theme switching
- **Lighthouse Score**: Optimized for 90+ mobile performance

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Animation**: Framer Motion
- **Charts**: Recharts for data visualization
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Blockchain**: Algorand SDK, AlgoKit Utils
- **Payments**: RevenueCat Web SDK
- **Build**: Vite, ESLint, PostCSS

## Custom Domain Setup

This application is configured to use the custom domain `aquaguardian.green` via Entri domain mapping to Netlify.

### DNS Configuration
To set up the custom domain:

1. **Purchase Domain**: Acquire `aquaguardian.green` from your preferred registrar
2. **Entri Setup**: Configure Entri to map the domain to your Netlify site
3. **DNS Records**: Point your domain's nameservers to Entri or configure these records:
   ```
   Type: CNAME
   Name: @
   Value: [your-netlify-site].netlify.app
   
   Type: CNAME  
   Name: www
   Value: [your-netlify-site].netlify.app
   ```
4. **SSL Certificate**: Netlify will automatically provision SSL certificates

### Environment Variables
Required environment variables for full functionality:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# RevenueCat Configuration
VITE_REVENUECAT_API_KEY=your_revenuecat_api_key
```

## Database Schema

The application uses the following key tables:

- **users**: User accounts with role-based access
- **designs**: Aquaponic system configurations
- **tokens**: Blockchain asset records
- **profiles**: Extended user profile data

Row Level Security (RLS) is enabled on all tables with appropriate policies for data isolation.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Deployment

The application is optimized for Netlify deployment with:
- Automatic builds from Git
- Environment variable management
- Custom domain support via Entri
- SSL certificate provisioning

## License

MIT License - see LICENSE file for details.

## Support

For technical support or subscription issues:
- Email: support@aquaguardian.green
- Documentation: [Coming Soon]
- Community: [Coming Soon]