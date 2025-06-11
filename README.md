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

# ElevenLabs Voice-over (Optional)
ELEVEN_API_KEY=your_elevenlabs_api_key
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