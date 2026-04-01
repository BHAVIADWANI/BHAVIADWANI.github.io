# Development Guide - MicroID

This guide covers everything you need to set up and develop the MicroID project locally.

## Prerequisites

- **Node.js**: v16 or higher (recommend v18+)
- **npm**: v8+ or **bun** package manager
- **Git**: For version control
- **Text Editor/IDE**: VS Code recommended

### Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Or if using bun
bun --version
```

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd micro-id-ai-main
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using bun (faster alternative):
```bash
bun install
```

### 3. Environment Configuration

Create `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your configuration:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Razorpay Configuration (for payments)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_here

# Optional: API Keys for external services
VITE_OPENAI_API_KEY=your_openai_key_here
```

## Development Server

### Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Local**: http://localhost:8080
- **Network**: Check terminal output for network URL

### Hot Module Replacement (HMR)

Changes to source files automatically reload in the browser. No manual refresh needed.

### Development Features

- Instant feedback on code changes
- TypeScript compilation errors shown in browser
- CSS hot reload
- Component-level updates with Vite

## Building

### Production Build

```bash
npm run build
```

Output: `dist/` folder with optimized assets

### Development Build

```bash
npm run build:dev
```

Useful for debugging with source maps while keeping dev-friendly output.

### Preview Production Build

```bash
npm run preview
```

Test the production build locally before deployment.

## Testing

### Run Tests Once

```bash
npm run test
```

### Watch Mode

```bash
npm run test:watch
```

Tests automatically re-run when files change.

### Test Configuration

- Framework: **Vitest**
- Setup: `src/test/setup.ts`
- Example tests: `src/test/example.test.ts`

## Code Quality

### Linting

```bash
npm run lint
```

Checks code against ESLint rules and displays issues.

### Fix Lint Issues

```bash
npm run lint -- --fix
```

Automatically fixes many common issues.

## Project Structure

```
micro-id-ai-main/
├── src/
│   ├── pages/                 # Page components (routed)
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn-ui components
│   │   ├── auth/             # Authentication
│   │   ├── dashboard/        # Dashboard modules
│   │   ├── biolab/           # BioLab components
│   │   ├── chemistry/        # Chemistry module
│   │   ├── docking/          # Molecular docking
│   │   └── ...               # Other feature modules
│   ├── contexts/              # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── SubscriptionContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and data
│   │   ├── utils.ts
│   │   ├── generatePdf.ts
│   │   ├── labInstrumentsData.ts
│   │   └── ...
│   ├── integrations/          # External service integrations
│   │   └── supabase/         # Supabase client
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── supabase/
│   ├── functions/            # Serverless functions
│   ├── migrations/           # Database schema
│   └── config.toml
├── public/                    # Static assets
│   └── images/
├── vite.config.ts            # Vite configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies & scripts
└── README.md                 # Project overview
```

## Key Technologies

### Frontend Framework
- **React 18.3** - UI rendering
- **TypeScript** - Type safety
- **Vite 5.4** - Build tool and dev server

### UI & Styling
- **Tailwind CSS 3.4** - Utility-first CSS
- **shadcn-ui** - Component library (Radix UI)
- **Framer Motion** - Animations

### State Management & Data
- **React Query** - Server state management
- **React Context** - App-level state
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### 3D & Visualization
- **Three.js** - 3D graphics
- **3DMol** - Molecular visualization
- **React Three Fiber** - React for Three.js
- **Recharts** - Data visualization

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database (via Supabase)
- **Edge Functions** - Serverless functions

## Common Tasks

### Adding a New Page

1. Create component in `src/pages/MyPage.tsx`
2. Add route in your router configuration
3. Import and use the page

### Adding a New Component

1. Create file in `src/components/`
2. Use TypeScript for type safety
3. Follow existing component patterns

### Adding a Utility Function

1. Create or edit files in `src/lib/`
2. Export functions for reuse
3. Add TypeScript types

### Working with Forms

Use React Hook Form + Zod for validation:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const form = useForm({ resolver: zodResolver(schema) });
```

### Creating a Context

1. Create file in `src/contexts/`
2. Define your context with TypeScript
3. Create a provider component
4. Export hook for easy access

## Debugging

### Browser DevTools

- Open: F12 or Right-click > Inspect
- React DevTools: Install browser extension
- Console: Check for errors and logs

### VS Code Debugging

1. Install Debugger extension (if needed)
2. Set breakpoints (click line number)
3. Run: `npm run dev`
4. DevTools should attach automatically

### Console Logging

```typescript
console.log("Debug info:", variable);
console.error("Error message");
console.warn("Warning message");
```

## Performance Optimization

### Code Splitting

Vite automatically code-splits at dynamic imports:

```typescript
const Component = React.lazy(() => import('./Component'));
```

### Image Optimization

- Use WebP format when possible
- Optimize before adding to project
- Consider lazy loading for images

### Bundle Analysis

```bash
npm run build
# Check dist/index.html for asset sizes
```

## Git Workflow

### Feature Branch

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git add .
git commit -m "Add amazing feature"

# Push to remote
git push origin feature/amazing-feature

# Create Pull Request
```

### Commit Messages

Use clear, descriptive messages:
- ✨ Feature: `feat: add new organism database`
- 🐛 Bug fix: `fix: correct organism identification logic`
- 📚 Documentation: `docs: update README`
- 🎨 Style: `style: format code`
- ♻️ Refactor: `refactor: simplify component`

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- --port 3000
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### TypeScript Errors

- Check file is saved
- Reload VS Code
- Run: `npm run build` to see errors

### Style Not Applying

- Verify Tailwind classes used
- Check specificity
- Clear browser cache (Ctrl+Shift+Delete)

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn-ui Docs](https://ui.shadcn.com)
- [Supabase Docs](https://supabase.com/docs)

## Support

For questions or issues:
1. Check existing documentation
2. Search closed issues
3. Open a new issue with details
4. Contact the development team

---

**Last Updated**: April 2026
