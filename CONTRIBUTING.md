# Contributing to AquaGuardian

Thank you for your interest in contributing to AquaGuardian! This guide will help you get started with development, testing, and contributing to the project.

## 🚀 Development Setup

### Prerequisites

- **Node.js**: Version 18.x or 20.x
- **npm**: Latest version
- **Git**: For version control
- **VS Code**: Recommended editor with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

### Local Development

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/aquaguardian.git
   cd aquaguardian
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   - Navigate to `http://localhost:5173`
   - The app will hot-reload as you make changes

### Database Setup (Optional)

For full functionality, set up Supabase:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migrations in `supabase/migrations/`
3. Add your Supabase URL and anon key to `.env`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── wizard/         # Wizard-specific components
│   └── ...
├── pages/              # Route components
├── lib/                # Utilities and services
│   ├── auth.tsx        # Authentication logic
│   ├── simulator.ts    # Simulation engine
│   └── ...
├── data/               # Static data and configurations
└── stripe-config.ts    # Payment configuration
```

### Key Principles

- **Component Organization**: Each component should have a single responsibility
- **File Size Limit**: Keep files under 300 lines; refactor when approaching this limit
- **Type Safety**: Use TypeScript for all new code
- **Responsive Design**: All components must work on mobile and desktop

## 🧪 Testing Guidelines

### Test Coverage Requirements

- **Minimum Coverage**: 80% across all metrics
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Running Tests

```bash
# Unit tests with coverage
npm run test:coverage

# End-to-end tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# Full QA suite
npm run qa:full
```

### Writing Tests

#### Unit Tests (Vitest)
```typescript
import { describe, it, expect } from 'vitest'
import { simulate } from '../lib/simulator'

describe('Simulator', () => {
  it('should calculate yields correctly', () => {
    const params = {
      farmSize: 'small',
      fishSpecies: ['Tilapia'],
      // ... other params
    }
    
    const result = simulate(params)
    expect(result.fishYieldKg).toBeGreaterThan(0)
  })
})
```

#### E2E Tests (Playwright)
```typescript
import { test, expect } from '@playwright/test'

test('wizard completion flow', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="start-wizard"]')
  
  // Test each step of the wizard
  await expect(page.locator('h1')).toContainText('Climate')
})
```

### Test Categories

1. **Authentication Flow**: Sign up, sign in, demo access
2. **Wizard Completion**: All 7 steps with validation
3. **Climate System**: Auto-detection, presets, custom climate validation
4. **Simulation Accuracy**: Yield calculations, climate factor application
5. **Tokenization**: Token creation, Algorand integration
6. **Payment Processing**: Stripe checkout and subscription flows

## 📝 Code Style Guidelines

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` type; use proper typing
- Use meaningful variable and function names

### React Components

```typescript
// Good: Functional component with proper typing
interface Props {
  title: string
  onSubmit: (data: FormData) => void
}

export function MyComponent({ title, onSubmit }: Props) {
  // Component implementation
}
```

### CSS/Tailwind

- Use Tailwind utility classes
- Follow mobile-first responsive design
- Use consistent spacing (8px system)
- Implement dark mode support

### File Naming

- **Components**: PascalCase (`MyComponent.tsx`)
- **Utilities**: camelCase (`myUtility.ts`)
- **Pages**: PascalCase (`MyPage.tsx`)
- **Types**: PascalCase (`MyTypes.ts`)

## 🔄 Git Workflow

### Branch Naming

- **Features**: `feature/description`
- **Bug fixes**: `fix/description`
- **Documentation**: `docs/description`
- **Refactoring**: `refactor/description`

### Commit Messages

Follow conventional commits:

```
feat: add climate-based yield adjustments
fix: resolve wizard validation issue
docs: update contributing guidelines
refactor: extract simulation logic
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   - Write code following style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Locally**
   ```bash
   npm run qa:full
   ```

4. **Submit Pull Request**
   - Use descriptive title and description
   - Reference any related issues
   - Ensure CI passes

5. **Code Review**
   - Address reviewer feedback
   - Maintain clean commit history

## 🚨 Quality Standards

### MUST-FIX Criteria

Issues are flagged as "MUST-FIX" when:

- ❌ **E2E Test Failures**: Any Playwright test fails
- ❌ **Coverage Below 80%**: Unit test coverage drops below threshold
- ❌ **Simulation Accuracy**: Yield calculations return 0 or invalid values
- ❌ **Climate Validation**: Climate factor application fails
- ❌ **Token Creation**: Blockchain integration fails
- ❌ **Payment Processing**: Stripe integration failures
- ❌ **Performance**: Lighthouse scores below 90%
- ❌ **Bundle Size**: Exceeds 5MB limit

### Performance Guidelines

- **Lighthouse Score**: Maintain 90+ on mobile
- **Bundle Size**: Keep under 5MB
- **Core Web Vitals**: Optimize LCP, FID, CLS
- **Image Optimization**: Use appropriate formats and sizes

## 🔧 Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright"
  ]
}
```

### Debugging

- **React DevTools**: For component debugging
- **Supabase Dashboard**: For database queries
- **Stripe Dashboard**: For payment testing
- **Browser DevTools**: For performance analysis

## 📊 Continuous Integration

### GitHub Actions

The project uses automated CI/CD:

1. **Multi-Node Testing**: Node.js 18.x and 20.x
2. **Cross-Browser E2E**: Chrome, Firefox, Safari, Mobile
3. **Security Audits**: Dependency vulnerabilities
4. **Performance Analysis**: Bundle size and Lighthouse scores
5. **Submission Validation**: Devpost readiness check

### Local CI Simulation

```bash
# Run the same checks as CI
npm run qa:full
npm run validate:submission
```

## 🐛 Bug Reports

When reporting bugs, include:

1. **Environment**: OS, browser, Node.js version
2. **Steps to Reproduce**: Clear, numbered steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Console Errors**: Any error messages

## 💡 Feature Requests

For new features:

1. **Use Case**: Describe the problem being solved
2. **Proposed Solution**: How should it work
3. **Alternatives**: Other approaches considered
4. **Impact**: Who benefits and how

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Email**: dev@aquaguardian.green for sensitive issues

## 🎯 Contribution Areas

We especially welcome contributions in:

- **Climate Data**: Expanding climate zone coverage
- **Simulation Accuracy**: Improving yield calculations
- **Accessibility**: Making the app more inclusive
- **Performance**: Optimizing load times and interactions
- **Documentation**: Improving guides and examples
- **Testing**: Adding test coverage and E2E scenarios

Thank you for contributing to sustainable agriculture technology! 🌱