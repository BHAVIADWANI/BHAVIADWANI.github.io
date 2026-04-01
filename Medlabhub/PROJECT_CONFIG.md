# MicroID Project Configuration

## Build & Development
- Build Tool: **Vite 5.4.19**
- Dev Server: Port 8080 with HMR enabled
- TypeScript: Strict mode enabled
- Code Splitting: Automatic at dynamic imports

## Dependencies Versions

### React & Core (v18+)
- react: ^18.3.1
- react-dom: ^18.3.1
- react-router-dom: ^6.30.1
- TypeScript: ^5.8.3

### UI Components
- @radix-ui/* - Latest stable versions
- shadcn-ui (via radix-ui)
- Tailwind CSS: ^3.4.17

### 3D & Visualization
- three: ^0.160
- 3dmol: ^2.5.4
- @react-three/fiber: ^8.18.0
- @react-three/drei: ^9.122.0

### Data & State
- @tanstack/react-query: ^5.83.0
- @supabase/supabase-js: ^2.95.3
- react-hook-form: ^7.61.1
- zod: ^3.25.76

### Styling & Animation
- Tailwind CSS: ^3.4.17
- Framer Motion: ^10.18.0
- tailwindcss-animate: ^1.0.7

### Utilities
- react-markdown: ^10.1.0
- jspdf: ^4.1.0
- xlsx: ^0.18.5
- date-fns: ^3.6.0
- recharts: ^2.15.4
- katex: ^0.16.41

### PWA
- vite-plugin-pwa: ^1.2.0

## Development Only (Removed)
- ~~lovable-tagger~~ - REMOVED: Not needed for standalone development

## Build Output
- Target: ES2020
- Module: ESM (ECMAScript Modules)
- Output Directory: `dist/`
- Max chunk size warning: 2000kb

## TypeScript Configuration
- Target: ES2020
- JSX: react-jsx
- Strict: true
- Module resolution: bundler
- Path aliases: `@` -> `./src`

## Project Standards

### Code Style
- ESLint with modern JavaScript standards
- TypeScript strict mode
- Prettier formatting (via ESLint)

### Component Structure
- Functional components with hooks
- TypeScript interfaces for props
- Clear separation of concerns

### File Naming
- Components: PascalCase (e.g., `MyComponent.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- Pages: PascalCase (e.g., `Dashboard.tsx`)

### Folder Organization
- `/src/pages` - Route components
- `/src/components` - Reusable components
- `/src/lib` - Utilities and data
- `/src/contexts` - Context providers
- `/src/hooks` - Custom hooks
- `/src/integrations` - External service clients

## Environment Setup

### Required Environment Variables
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_RAZORPAY_KEY_ID
```

### Optional
```
VITE_OPENAI_API_KEY
VITE_API_BASE_URL
```

## Scripts

| Script | Purpose |
|--------|---------|
| `dev` | Start development server |
| `build` | Production build |
| `build:dev` | Development-mode build |
| `preview` | Preview production build |
| `lint` | Run ESLint |
| `test` | Run tests (Vitest) |
| `test:watch` | Watch mode testing |

## Performance Targets
- Lighthouse Score: 90+
- Bundle Size: < 500KB gzipped
- First Paint: < 2s
- Time to Interactive: < 4s

## Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS 13+, Android 9+

## Quality Metrics
- TypeScript: Strict mode enabled
- ESLint: No warnings in production builds
- Test Coverage: Target 80%+
- Accessibility: WCAG 2.1 AA compliance

---

**Last Updated**: April 2026
**Maintained By**: MicroID Development Team
