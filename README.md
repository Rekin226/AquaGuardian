# AquaGuardian

A comprehensive aquaponic system design and simulation platform with blockchain tokenization capabilities and integrated payments.

## 🌱 Overview

AquaGuardian democratizes sustainable agriculture through intelligent aquaponic system design, real-time performance simulation, and blockchain-powered investment opportunities. Our platform makes aquaponics accessible to everyone, from hobbyists to commercial farmers.

### Key Features

- **🧙‍♂️ Interactive Design Wizard**: Step-by-step system configuration with climate-aware optimization
- **📊 Advanced Simulation Engine**: Real-time yield predictions and resource consumption analysis
- **🔗 Blockchain Tokenization**: Convert systems into tradeable digital assets on Algorand
- **📈 Analytics Dashboard**: Beautiful data visualization with performance tracking
- **🏪 Community Marketplace**: Discover and share designs from the global community
- **💳 Pro Designer Subscription**: Unlimited features for $9/month

### Climate-Based Optimization

- **Auto-Detection**: Automatically detects climate zone from user's timezone
- **Climate Presets**: Tropical, Sub-tropical, Temperate, and Cool climate zones
- **Custom Climate**: Manual temperature and solar radiation input for precise modeling
- **Yield Adjustments**: Fish growth and vegetable yields automatically adjust based on climate factors

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database and auth)
- Stripe account (for payments, optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/aquaguardian/platform.git
cd aquaguardian

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your environment variables (see DEPLOYMENT.md)
# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file with the following required variables:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration (OPTIONAL)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# RevenueCat Configuration (OPTIONAL)
VITE_REVENUECAT_API_KEY=your_revenuecat_api_key
```

**Note**: Algorand TestNet configuration is handled automatically with inline constants.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Blockchain**: Algorand SDK with TestNet integration
- **Payments**: Stripe + RevenueCat for subscriptions
- **Deployment**: Netlify with custom domain support

## 📚 Documentation

- **[Contributing Guide](CONTRIBUTING.md)** - Development setup, testing, and code style
- **[Deployment Guide](DEPLOYMENT.md)** - Complete deployment instructions
- **[Architecture Overview](ARCHITECTURE.md)** - Technical architecture and data flow
- **[Video Production](VIDEO_PRODUCTION.md)** - Demo video generation pipeline

## 🧪 Testing

```bash
# Run unit tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run full QA suite
npm run qa:full
```

## 🌍 Climate System

The platform automatically detects your climate zone and adjusts simulations accordingly:

- **Tropical**: 25°C, 1.15× solar factor
- **Sub-tropical**: 22°C, 1.05× solar factor  
- **Temperate**: 18°C, 0.90× solar factor
- **Cool**: 14°C, 0.75× solar factor

## 🔗 Algorand Integration

Built on Algorand's carbon-negative blockchain for sustainable tokenization:

- **Asset Tokenization**: Convert aquaponic systems into digital assets
- **Fractional Ownership**: Enable community-supported agriculture
- **Performance-Based Value**: Token value tied to actual system metrics
- **TestNet Ready**: Inline configuration for immediate blockchain features

## 💰 Subscription Plans

### Free Plan
- 3 system simulations
- Basic analytics
- Community marketplace access

### Pro Designer ($9/month)
- Unlimited simulations
- Advanced analytics
- Unlimited token minting
- Priority support
- Commercial usage rights

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [aquaguardian.green](https://aquaguardian.green)
- **Documentation**: [docs.aquaguardian.green](https://docs.aquaguardian.green)
- **Support**: support@aquaguardian.green

---

*Building sustainable agriculture through technology* 🌱