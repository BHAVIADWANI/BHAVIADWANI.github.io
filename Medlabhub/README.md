# MicroID — Microbiology Identification

An AI-powered microbiology identification and analysis platform designed for students, researchers, and laboratory professionals.

## Getting Started

### Prerequisites
- Node.js 16+ (recommend using nvm)
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd micro-id-ai-main

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development

```bash
# Start development server
npm run dev

# Development server runs on: http://localhost:8080
```

### Building

```bash
# Production build
npm run build

# Development build
npm run build:dev

# Preview production build locally
npm run preview
```

### Testing

```bash
# Run tests once
npm run test

# Watch mode
npm run test:watch
```

### Linting

```bash
# Check code quality
npm run lint
```
