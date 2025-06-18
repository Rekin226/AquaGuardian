# AquaGuardian Architecture

This document provides a comprehensive overview of AquaGuardian's technical architecture, data flow, and system design decisions.

## 🏗️ System Overview

AquaGuardian is a full-stack web application built with modern technologies to provide aquaponic system design, simulation, and tokenization capabilities.

### Architecture Principles

- **Modular Design**: Clear separation of concerns across components
- **Type Safety**: TypeScript throughout the application
- **Responsive First**: Mobile-optimized with desktop enhancement
- **Performance Focused**: Optimized for Core Web Vitals
- **Security by Design**: Row-level security and proper authentication

## 🔧 Technology Stack

### Frontend Layer

```mermaid
graph TB
    subgraph "Frontend Technologies"
        A[React 18] --> B[TypeScript]
        B --> C[Tailwind CSS]
        C --> D[Framer Motion]
        D --> E[Recharts]
        E --> F[Lucide React]
    end
    
    subgraph "Build Tools"
        G[Vite] --> H[ESLint]
        H --> I[PostCSS]
        I --> J[Autoprefixer]
    end
    
    A --> G
```

**Key Technologies:**
- **React 18**: Component-based UI with concurrent features
- **TypeScript**: Type-safe development with strict configuration
- **Tailwind CSS**: Utility-first styling with custom design system
- **Framer Motion**: Smooth animations and micro-interactions
- **Recharts**: Interactive data visualization
- **Vite**: Fast development and optimized builds

### Backend & Infrastructure

```mermaid
graph TB
    subgraph "Backend Services"
        A[Supabase] --> B[PostgreSQL]
        A --> C[Auth]
        A --> D[Edge Functions]
        A --> E[Row Level Security]
    end
    
    subgraph "External Services"
        F[Stripe] --> G[Payment Processing]
        H[RevenueCat] --> I[Subscription Management]
        J[Algorand] --> K[Blockchain Integration]
    end
    
    subgraph "Deployment"
        L[Netlify] --> M[Global CDN]
        L --> N[Custom Domain]
        L --> O[SSL Certificate]
    end
```

**Key Services:**
- **Supabase**: Backend-as-a-Service with PostgreSQL, authentication, and real-time features
- **Stripe**: Payment processing and subscription management
- **RevenueCat**: Cross-platform subscription analytics
- **Algorand**: Carbon-negative blockchain for asset tokenization
- **Netlify**: Global deployment with CDN and custom domain

## 📊 Data Architecture

### Database Schema

```mermaid
erDiagram
    users {
        uuid id PK
        text email UK
        user_role role
        timestamptz created_at
    }
    
    designs {
        uuid id PK
        uuid user_id FK
        text name
        jsonb params
        timestamptz created_at
    }
    
    tokens {
        uuid id PK
        uuid design_id FK
        text algorand_tx
        timestamptz created_at
    }
    
    profiles {
        uuid id PK
        uuid user_id FK
        text name
        text locale
        text species
        numeric tank_volume_l
        numeric target_ph
        text push_token
        timestamptz created_at
        timestamptz updated_at
    }
    
    stripe_customers {
        bigint id PK
        uuid user_id FK
        text customer_id UK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }
    
    stripe_subscriptions {
        bigint id PK
        text customer_id UK
        text subscription_id
        text price_id
        bigint current_period_start
        bigint current_period_end
        boolean cancel_at_period_end
        text payment_method_brand
        text payment_method_last4
        stripe_subscription_status status
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }
    
    users ||--o{ designs : creates
    designs ||--o{ tokens : tokenizes
    users ||--|| profiles : has
    users ||--|| stripe_customers : billing
    stripe_customers ||--|| stripe_subscriptions : subscribes
```

### Row Level Security (RLS)

All tables implement RLS policies for data isolation:

```sql
-- Example: Users can only access their own designs
CREATE POLICY "Users can manage own designs" 
ON designs 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid());
```

## 🔄 Data Flow Architecture

### Application Flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as Wizard
    participant S as Simulator
    participant DB as Supabase
    participant A as Algorand
    participant P as Payments
    
    U->>W: Configure System
    W->>S: Run Simulation
    S->>S: Apply Climate Factors
    S->>DB: Save Design
    DB->>U: Display Results
    
    opt Tokenization
        U->>A: Create Asset Token
        A->>DB: Store Transaction
        DB->>U: Confirm Token
    end
    
    opt Pro Upgrade
        U->>P: Purchase Subscription
        P->>DB: Update User Status
        DB->>U: Unlock Features
    end
```

### Simulation Engine Flow

```mermaid
graph TD
    A[Wizard Input] --> B[Climate Detection]
    B --> C[System Type Selection]
    C --> D[Parameter Validation]
    D --> E[Yield Calculations]
    E --> F[Resource Consumption]
    F --> G[Efficiency Analysis]
    G --> H[Cost Estimation]
    H --> I[Results Display]
    
    subgraph "Climate Factors"
        J[Temperature] --> E
        K[Solar Radiation] --> E
        L[Custom Values] --> E
    end
    
    subgraph "System Types"
        M[Media Bed] --> E
        N[NFT] --> E
        O[DWC] --> E
    end
```

## 🧩 Component Architecture

### Component Hierarchy

```
App
├── AuthProvider
│   ├── ThemeProvider
│   │   ├── SubscriptionProvider
│   │   │   ├── Layout
│   │   │   │   ├── Sidebar Navigation
│   │   │   │   └── Main Content
│   │   │   │       ├── Wizard
│   │   │   │       ├── Dashboard
│   │   │   │       ├── MyDesignsPage
│   │   │   │       ├── Marketplace
│   │   │   │       ├── Settings
│   │   │   │       └── Billing
│   │   │   └── Modals & Dialogs
│   │   └── Theme Toggle
│   └── Authentication
└── Router
```

### State Management

```mermaid
graph TB
    subgraph "Global State"
        A[AuthContext] --> B[User Session]
        A --> C[Profile Data]
        
        D[ThemeContext] --> E[Dark/Light Mode]
        D --> F[System Preference]
        
        G[SubscriptionContext] --> H[Pro Status]
        G --> I[Billing Info]
    end
    
    subgraph "Local State"
        J[Wizard State] --> K[Form Data]
        J --> L[Validation]
        
        M[Dashboard State] --> N[Design Data]
        M --> O[Simulation Results]
    end
    
    subgraph "Server State"
        P[React Query] --> Q[API Calls]
        P --> R[Caching]
        P --> S[Background Updates]
    end
```

## 🔐 Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant S as Supabase Auth
    participant DB as Database
    
    U->>A: Sign In Request
    A->>S: Authenticate
    S->>S: Verify Credentials
    S->>A: Return JWT Token
    A->>DB: Fetch User Profile
    DB->>A: Return Profile Data
    A->>U: Authenticated Session
    
    Note over A,DB: All subsequent requests include JWT
    Note over DB: RLS policies enforce data isolation
```

### Security Measures

1. **Row Level Security (RLS)**: Database-level access control
2. **JWT Authentication**: Secure token-based authentication
3. **Environment Variables**: Sensitive data protection
4. **HTTPS Only**: All communications encrypted
5. **Input Validation**: Client and server-side validation
6. **CORS Configuration**: Proper cross-origin resource sharing

## 🚀 Performance Architecture

### Optimization Strategies

```mermaid
graph TB
    subgraph "Frontend Optimizations"
        A[Code Splitting] --> B[Lazy Loading]
        B --> C[Tree Shaking]
        C --> D[Bundle Analysis]
    end
    
    subgraph "Runtime Optimizations"
        E[React.memo] --> F[useMemo/useCallback]
        F --> G[Virtual Scrolling]
        G --> H[Image Optimization]
    end
    
    subgraph "Network Optimizations"
        I[CDN Delivery] --> J[Compression]
        J --> K[Caching Headers]
        K --> L[Preloading]
    end
```

### Performance Metrics

- **Lighthouse Score**: 90+ on mobile
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: < 5MB total

## 🔄 CI/CD Pipeline

### Deployment Flow

```mermaid
graph TD
    A[Git Push] --> B[GitHub Actions]
    B --> C[Install Dependencies]
    C --> D[Run Tests]
    D --> E[Build Application]
    E --> F[Deploy to Netlify]
    F --> G[Update DNS]
    G --> H[SSL Certificate]
    H --> I[Live Site]
    
    subgraph "Quality Gates"
        J[Unit Tests] --> D
        K[E2E Tests] --> D
        L[Lint Check] --> D
        M[Type Check] --> D
    end
```

### Environment Management

- **Development**: Local development with hot reload
- **Staging**: Preview deployments for testing
- **Production**: Live site with custom domain

## 📱 Mobile Architecture

### Responsive Design Strategy

```mermaid
graph TB
    subgraph "Breakpoints"
        A[Mobile: 320-768px] --> B[Tablet: 768-1024px]
        B --> C[Desktop: 1024px+]
    end
    
    subgraph "Mobile Optimizations"
        D[Touch Targets] --> E[Gesture Support]
        E --> F[Offline Capability]
        F --> G[Progressive Enhancement]
    end
    
    subgraph "Performance"
        H[Lazy Loading] --> I[Image Optimization]
        I --> J[Critical CSS]
        J --> K[Service Worker]
    end
```

## 🧪 Testing Architecture

### Testing Strategy

```mermaid
graph TB
    subgraph "Unit Tests"
        A[Component Tests] --> B[Utility Tests]
        B --> C[Hook Tests]
        C --> D[Service Tests]
    end
    
    subgraph "Integration Tests"
        E[API Integration] --> F[Database Tests]
        F --> G[Auth Flow Tests]
    end
    
    subgraph "E2E Tests"
        H[User Journeys] --> I[Cross-Browser]
        I --> J[Mobile Testing]
        J --> K[Performance Tests]
    end
    
    A --> L[Coverage Report]
    E --> L
    H --> L
```

### Test Coverage Requirements

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

## 🔮 Future Architecture Considerations

### Scalability Improvements

1. **Microservices**: Split simulation engine into separate service
2. **Caching Layer**: Redis for frequently accessed data
3. **Message Queue**: Background job processing
4. **API Gateway**: Rate limiting and request routing
5. **Database Sharding**: Horizontal scaling for large datasets

### Technology Evolution

1. **React Server Components**: Server-side rendering improvements
2. **Edge Computing**: Move simulation closer to users
3. **WebAssembly**: High-performance calculations
4. **Progressive Web App**: Native app-like experience
5. **Real-time Collaboration**: Multi-user design sessions

## 📊 Monitoring & Observability

### Application Monitoring

- **Error Tracking**: Sentry for error monitoring
- **Performance Monitoring**: Web Vitals tracking
- **User Analytics**: Privacy-focused analytics
- **Uptime Monitoring**: Service availability tracking

### Business Metrics

- **User Engagement**: Design creation rates
- **Conversion Metrics**: Free to Pro upgrades
- **System Performance**: Simulation accuracy
- **Support Metrics**: Response times and resolution rates

---

This architecture supports AquaGuardian's mission of democratizing sustainable agriculture through technology while maintaining high performance, security, and scalability standards.