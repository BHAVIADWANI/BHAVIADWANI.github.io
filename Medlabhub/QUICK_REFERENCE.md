# Quick Reference Guide - Medlabhub

## 🚀 Quick Start (2 minutes)

```bash
# 1. Install dependencies
npm install
# or
bun install

# 2. Create environment file
cp .env.example .env.local

# 3. Start development server
npm run dev

# 4. Open browser
# → http://localhost:8080
```

## 📚 Documentation Map

| Document | Use Case |
|----------|----------|
| **README.md** | Project overview, tech stack, features |
| **DEVELOPMENT.md** | Setup, development workflow, debugging |
| **PROJECT_CONFIG.md** | Configuration, standards, dependencies |
| **MIGRATION.md** | AI gateway migration instructions |
| **CLEANUP_SUMMARY.md** | What was changed, verification checklist |
| **This File** | Quick reference and common commands |

## 🎯 Common Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview prod build
npm run build:dev        # Dev-mode build
```

### Testing & Quality
```bash
npm run test             # Run tests once
npm run test:watch       # Watch mode
npm run lint             # Check code quality
npm run lint -- --fix    # Auto-fix lint issues
```

### Project Setup
```bash
# First time setup
npm install
cp .env.example .env.local
npm run dev

# Reset everything
rm -rf node_modules
npm install
npm run dev
```

## 🔧 Environment Variables

Create `.env.local`:

```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key

# Optional (for AI services)
VITE_OPENAI_API_KEY=sk-your-key-here
```

## 📁 Project Structure

```
src/
├── pages/              # Route pages (Page.tsx)
├── components/         # Reusable components (Component.tsx)
├── contexts/           # State providers (*Context.tsx)
├── hooks/             # Custom hooks (useHook.ts)
├── lib/               # Utilities & data (*.ts)
├── integrations/      # External clients (supabase/)
├── App.tsx            # Root component
└── main.tsx           # Entry point
```

## 🎨 Component Pattern

```typescript
import React from 'react';

interface Props {
  title: string;
  onClose?: () => void;
}

export const MyComponent: React.FC<Props> = ({ title, onClose }) => {
  return (
    <div className="p-4">
      <h1>{title}</h1>
      {onClose && <button onClick={onClose}>Close</button>}
    </div>
  );
};
```

## 🔍 Debugging

### Browser DevTools
- Open: F12
- Elements tab: Inspect DOM
- Console tab: View logs
- React tab: Inspect components (requires extension)

### VS Code Debugging
1. Set breakpoint (click line number)
2. F5 to start debugger
3. DevTools should attach

### Common Issues

| Issue | Solution |
|-------|----------|
| Port 8080 in use | `npm run dev -- --port 3000` |
| Modules not found | `npm install` |
| TypeScript errors | Check `.ts` file syntax, restart editor |
| Styles not applying | Clear cache, refresh browser |
| Build fails | Check `npm run lint`, fix errors |

## 🎯 Development Workflow

### Creating a New Page
1. Create file in `src/pages/MyPage.tsx`
2. Add route in routing config
3. Test at `/my-page`

### Adding a Component
1. Create file in `src/components/MyComponent.tsx`
2. Export component
3. Import and use in pages

### Using Supabase
```typescript
import { useSupabase } from '@/integrations/supabase';

const { data, error } = await supabase
  .from('organisms')
  .select('*')
  .limit(10);
```

### Creating a Hook
```typescript
// src/hooks/useCustom.ts
export const useCustom = () => {
  const [state, setState] = useState(null);
  return { state, setState };
};

// Usage
const { state } = useCustom();
```

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3 | UI framework |
| typescript | ^5.8 | Type safety |
| vite | ^5.4 | Build tool |
| tailwindcss | ^3.4 | Styling |
| @supabase/supabase-js | ^2.95 | Backend |
| react-router-dom | ^6.30 | Routing |
| react-hook-form | ^7.61 | Forms |
| zod | ^3.25 | Validation |

## 🚀 Deployment

### Build for Production
```bash
npm run build
# → dist/ folder created
```

### Deploy Options
- **Vercel**: `vercel` CLI
- **Netlify**: Drag & drop `dist/`
- **AWS**: Upload to S3 + CloudFront
- **GitHub Pages**: Push to `gh-pages` branch

## 📚 Learning Resources

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com/docs)

## ✅ Pre-Commit Checklist

Before committing:
```bash
npm run lint          # ✅ Code quality
npm run test          # ✅ Tests pass
npm run build:dev     # ✅ Builds successfully
```

## 🆘 Getting Help

1. **Check Documentation**: Read relevant `.md` file
2. **Search Codebase**: Find similar implementations
3. **Check Types**: Hover over variables in VS Code
4. **Console**: Check browser console for errors
5. **Ask Team**: Contact development team

## 🎓 Tips & Tricks

### Type Safety
- Always use TypeScript interfaces/types
- Enable strict mode in `tsconfig.json`
- Use `satisfies` operator for type checking

### Performance
- Use `React.memo` for expensive components
- Lazy load routes with `React.lazy()`
- Optimize images before adding

### Code Organization
- Keep components small and focused
- Extract reusable logic to hooks
- Use context only when needed
- Group related files together

## 📋 Cleanup Reminder

### Clean Node Modules
```bash
rm -rf node_modules
npm install
```

### Clean Build
```bash
rm -rf dist
npm run build
```

### View File Sizes
```bash
npm run build
# Check dist/ folder
```

## 🔐 Security Notes

- Never commit `.env` files
- Keep API keys in environment variables
- Use HTTPS in production
- Validate all user inputs
- Keep dependencies updated

## 📊 Project Status

- **Status**: ✅ Ready for Development
- **Last Updated**: April 2026
- **Node Version**: 16+
- **Package Manager**: npm or bun

## 🎉 You're All Set!

Everything is configured and ready to go. Start developing with:

```bash
npm run dev
```

Questions? Check the documentation files or ask the team!

---

**Happy Coding! 🚀**
