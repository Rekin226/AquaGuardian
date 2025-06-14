# AquaGuardian

A comprehensive aquaponic system design and simulation platform with blockchain tokenization capabilities and integrated Stripe payments.

## Features

### 🌱 Core Functionality
- **Location Preset**: Auto-detect climate zone based on timezone for accurate yield estimates
- **Interactive Design Wizard**: Step-by-step aquaponic system configuration
- **Real-time Simulation**: Advanced performance modeling with yield predictions
- **Performance Analytics**: 30-day cumulative charts and efficiency metrics
- **Design Marketplace**: Community sharing and discovery platform

### 🌍 Climate-Based Optimization
- **Auto-Detection**: Automatically detects climate zone from user's timezone
- **Climate Presets**: Tropical, Sub-tropical, Temperate, and Cool climate zones
- **Custom Climate**: Manual temperature and solar radiation input for precise modeling
- **Yield Adjustments**: Fish growth and vegetable yields automatically adjust based on climate factors
- **Energy Estimates**: Climate-aware energy consumption calculations

### 💳 Payment Integration
- **Stripe Checkout**: Secure payment processing with credit cards and digital wallets
- **Subscription Management**: Automated billing and subscription lifecycle management
- **Multiple Payment Methods**: Support for cards, Apple Pay, Google Pay, and more
- **Invoice Management**: Automated invoice generation and payment tracking
- **Webhook Integration**: Real-time payment status updates and subscription changes

### 💎 Pro Designer Subscription ($9/month)
- **Unlimited Simulations**: No restrictions on system designs
- **Advanced Analytics**: Detailed performance insights and comparisons
- **Token Minting**: Unlimited blockchain asset creation
- **Priority Support**: Dedicated customer assistance
- **Export Features**: Detailed PDF reports and data export

### 🔗 Blockchain Integration
- **Asset Tokenization**: Convert aquaponic systems into tradeable digital assets
- **Algorand TestNet**: Carbon-negative blockchain for sustainable tokenization (inline configuration)
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
- **Payments**: Stripe (Primary), RevenueCat (Mobile)
- **Blockchain**: Algorand SDK, AlgoKit Utils (TestNet with inline config)
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
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration (REQUIRED for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# RevenueCat Configuration (OPTIONAL for mobile subscriptions)
VITE_REVENUECAT_API_KEY=your_revenuecat_api_key

# ElevenLabs Voice-over (OPTIONAL for video production)
ELEVEN_API_KEY=your_elevenlabs_api_key
```

**Note**: Algorand TestNet configuration is now handled with inline constants in `src/lib/algorand.ts`. No environment variables needed for blockchain features.

## Climate System

### Auto-Detection
The system automatically detects the user's climate zone based on their timezone:

```typescript
// Automatically detects climate from timezone
const detectedClimate = detectClimateFromTimezone()
// Returns: 'tropical' | 'subtropical' | 'temperate' | 'cool'
```

### Climate Presets
Four climate zones with specific temperature and solar factors:

- **Tropical**: 25°C, 1.15× solar factor
- **Sub-tropical**: 22°C, 1.05× solar factor  
- **Temperate**: 18°C, 0.90× solar factor
- **Cool**: 14°C, 0.75× solar factor

### Custom Climate
Users can specify custom values:
- **Water Temperature**: 10-30°C range
- **Solar Radiation**: 0.5-8 kWh/m²/day range

### Impact on Simulation
Climate factors directly affect:
- **Fish Growth**: `fishYield *= (temperature / 20)` - warmer water increases fish growth
- **Plant Growth**: `vegYield *= solarFactor` - more solar radiation increases plant yields
- **Energy Usage**: Climate-aware energy consumption calculations

## Stripe Payment Setup

### 1. Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Get your API keys from the Dashboard

### 2. Configure Products
Create these products in your Stripe Dashboard:

```json
{
  "pro_monthly": {
    "name": "Pro Designer Monthly",
    "price": "$9.00",
    "interval": "month",
    "trial_period_days": 7
  },
  "pro_yearly": {
    "name": "Pro Designer Yearly", 
    "price": "$99.00",
    "interval": "year",
    "trial_period_days": 7
  }
}
```

### 3. Webhook Configuration
Set up webhooks in Stripe Dashboard:

**Endpoint URL**: `https://aquaguardian.green/api/stripe/webhook`

**Events to listen for**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `checkout.session.completed`

### 4. Test Cards
Use these test cards for development:

```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
American Express: 3782 822463 10005
Declined: 4000 0000 0000 0002
```

## Algorand Configuration

The application uses **inline TestNet configuration** for Algorand blockchain integration:

```typescript
// src/lib/algorand.ts
export const ALGOD_SERVER = "https://testnet-api.algonode.cloud";
export const ALGOD_TOKEN = "";
export const CHAIN_ID = "TestNet";
```

This eliminates the need for Algorand environment variables and ensures consistent TestNet connectivity across all deployments.

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

## Testing & QA

### 🧪 Comprehensive Test Suite

AquaGuardian includes a robust QA suite with multiple testing layers:

#### Unit Tests
```bash
# Run unit tests with coverage
npm run test:coverage

# Watch mode for development
npm test
```

#### End-to-End Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed
```

#### Full QA Suite
```bash
# Run all tests + validation
npm run qa:full
```

### 🎯 Test Coverage

The test suite covers:

- **Authentication Flow**: Sign up, sign in, demo access
- **Wizard Completion**: All 7 steps with validation (including climate selection)
- **Climate System**: Auto-detection, presets, custom climate validation
- **Simulation Accuracy**: Yield calculations > 0, realistic values, climate factor application
- **Tokenization**: Token creation, Algorand integration
- **Payment Processing**: Stripe checkout and subscription flows
- **Navigation**: Sidebar, mobile, theme switching
- **Marketplace**: Search, filters, design cards

### 📊 Coverage Requirements

- **Minimum Coverage**: 80% across all metrics
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### 🚨 MUST-FIX Criteria

Tests automatically flag issues as "MUST-FIX" when:

- ❌ **E2E Test Failures**: Any Playwright test fails
- ❌ **Coverage Below 80%**: Unit test coverage drops below threshold
- ❌ **Simulation Accuracy**: Yield calculations return 0 or invalid values
- ❌ **Climate Validation**: Climate factor application fails
- ❌ **Token Creation**: Blockchain integration fails
- ❌ **Payment Processing**: Stripe integration failures
- ❌ **Performance**: Lighthouse scores below 90%
- ❌ **Bundle Size**: Exceeds 5MB limit

### 🔄 Continuous Integration

GitHub Actions automatically runs:

1. **Multi-Node Testing**: Node.js 18.x and 20.x
2. **Cross-Browser E2E**: Chrome, Firefox, Safari, Mobile
3. **Security Audits**: Dependency vulnerabilities
4. **Performance Analysis**: Bundle size and Lighthouse scores
5. **Submission Validation**: Devpost readiness check

### 📱 Mobile Testing

E2E tests include mobile viewport testing:
- **Mobile Chrome**: Pixel 5 simulation
- **Mobile Safari**: iPhone 12 simulation
- **Responsive Design**: Breakpoint validation

### 🔍 Test Reports

Automated reports generated:
- **HTML Report**: Visual test results with screenshots
- **JSON Report**: Machine-readable results
- **JUnit XML**: CI/CD integration
- **Coverage Report**: Detailed coverage analysis

## Video Production Pipeline

### 🎬 Demo Video Generation

AquaGuardian includes a comprehensive video production system for creating marketing demos:

#### 1. Interactive Storyboard
```bash
# Open the interactive storyboard
npm run storyboard
# or manually open: public/storyboard.html
```

The storyboard provides:
- **Visual Timeline**: 7 scenes over 3 minutes
- **Interactive Controls**: Play, pause, reset functionality
- **Voice-over Integration**: ElevenLabs API integration
- **Progress Tracking**: Real-time progress and timing display

#### 2. Voice-over Generation
Set up ElevenLabs integration for professional voice-over:

```bash
# Set your ElevenLabs API key
export ELEVEN_API_KEY=your_api_key_here

# Or add to .env file
echo "ELEVEN_API_KEY=your_api_key_here" >> .env
```

The system will automatically generate voice-over for each scene using the Bella voice model.

#### 3. Video Production
Generate the final MP4 video using FFmpeg:

```bash
# Build the complete demo video
npm run build:video
```

This command:
- ✅ Checks for FFmpeg installation
- 📁 Validates all demo assets exist
- 🎬 Combines PNG sequences with timing
- 🎵 Adds title overlays and transitions
- 📊 Outputs production-ready MP4

#### 4. Demo Assets Required

Place these PNG files in `/demo-assets/` directory:

```
demo-assets/
├── hero-splash.png           # Welcome screen (0-15s)
├── wizard-flow.png           # Design wizard (15-45s)
├── simulation-dashboard.png  # Performance simulation (45-75s)
├── analytics-charts.png      # Analytics dashboard (75-105s)
├── tokenization-interface.png # Blockchain features (105-135s)
├── pro-features.png          # Pro subscription (135-165s)
└── call-to-action.png        # Final CTA (165-180s)
```

#### 5. Manual FFmpeg Commands

For custom video production, use these FFmpeg commands:

```bash
# Basic concatenation (no titles)
ffmpeg -y \
  -loop 1 -t 15 -i "demo-assets/hero-splash.png" \
  -loop 1 -t 30 -i "demo-assets/wizard-flow.png" \
  -loop 1 -t 30 -i "demo-assets/simulation-dashboard.png" \
  -loop 1 -t 30 -i "demo-assets/analytics-charts.png" \
  -loop 1 -t 30 -i "demo-assets/tokenization-interface.png" \
  -loop 1 -t 30 -i "demo-assets/pro-features.png" \
  -loop 1 -t 15 -i "demo-assets/call-to-action.png" \
  -filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v0];[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v1];[2:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v2];[3:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v3];[4:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v4];[5:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v5];[6:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v6];[v0][v1][v2][v3][v4][v5][v6]concat=n=7:v=1:a=0[outv]" \
  -map "[outv]" \
  -c:v libx264 \
  -preset medium \
  -crf 23 \
  -pix_fmt yuv420p \
  demo.mp4

# High quality version
ffmpeg -y [same inputs] -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p demo-hq.mp4
```

#### 6. Video Specifications

- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 FPS
- **Duration**: 3 minutes (180 seconds)
- **Format**: MP4 (H.264)
- **Quality**: CRF 23 (balanced) or CRF 18 (high quality)

### 🎯 Scene Breakdown

| Scene | Duration | Content | Voice-over |
|-------|----------|---------|------------|
| 1 | 0-15s | Welcome & Branding | Platform introduction |
| 2 | 15-45s | Design Wizard | Step-by-step configuration |
| 3 | 45-75s | Simulation Engine | Performance predictions |
| 4 | 75-105s | Analytics Dashboard | Data visualization |
| 5 | 105-135s | Blockchain Features | Tokenization benefits |
| 6 | 135-165s | Pro Subscription | Premium features |
| 7 | 165-180s | Call to Action | Website and signup |

## Devpost Submission

### 📋 Submission Validation

Validate your Devpost submission with automated checks:

```bash
# Run comprehensive submission validation
npm run validate:submission

# Prepare complete Devpost bundle
npm run prepare:devpost
```

The validation script checks:
- ✅ All required sections in SUBMISSION.md
- 🔗 External link accessibility
- 📸 Screenshot availability
- 📊 Mermaid diagram inclusion
- 🏆 Algorand integration completeness

### 📊 Submission Checklist

The system generates `submission_checklist.json` with boolean flags for:

**Sections**
- Inspiration / Problem statement
- What it does description
- Tech stack & architecture
- Algorand challenge fit
- Screenshots embedded

**Technical Requirements**
- Mermaid diagrams included
- External links validated
- Screenshots exist
- SUBMISSION.md complete

**Algorand Integration**
- Blockchain features described
- Sustainability impact explained
- Financial inclusion addressed
- Technical innovation highlighted

**Deployment**
- Live demo accessible
- GitHub repository public
- Video demo available
- Documentation complete

## Deployment

The application is optimized for Netlify deployment with:
- Automatic builds from Git
- Environment variable management
- Custom domain support via Entri
- SSL certificate provisioning
- Stripe webhook endpoints

### Deployment Checklist

1. **Environment Variables**: Configure all required variables in Netlify
2. **Stripe Setup**: Create products and configure webhooks
3. **Domain Configuration**: Set up custom domain with SSL
4. **Database Migration**: Run Supabase migrations
5. **Testing**: Verify payment flows and subscription management

## Security Considerations

- **PCI Compliance**: Stripe handles all payment data securely
- **Environment Variables**: Never commit sensitive keys to version control
- **Row Level Security**: Database access is properly restricted
- **HTTPS Only**: All payment flows require SSL encryption
- **Webhook Validation**: Stripe webhook signatures are verified

## License

MIT License - see LICENSE file for details.

## Support

For technical support or subscription issues:
- Email: support@aquaguardian.green
- Billing: billing@aquaguardian.green
- Documentation: [Coming Soon]
- Community: [Coming Soon]

---

**Payment Processing**: Powered by Stripe  
**Blockchain**: Algorand TestNet  
**Hosting**: Netlify with custom domain