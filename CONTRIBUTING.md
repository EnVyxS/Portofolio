# Contributing to Interactive Digital Portfolio

Thank you for your interest in this project! This is a personal portfolio project showcasing advanced web development techniques.

## Development Setup

1. **Prerequisites**
   - Node.js 18+ 
   - npm or yarn package manager

2. **Installation**
   ```bash
   git clone https://github.com/EnVyxS/interactive-portfolio.git
   cd interactive-portfolio
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Add your ElevenLabs API key to .env
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```

## Project Architecture

### Frontend Structure
```
client/src/
├── components/     # Reusable UI components
├── views/         # Page-level components
├── controllers/   # Business logic controllers
├── context/       # React context providers
├── hooks/         # Custom React hooks
├── services/      # API service layers
├── constants/     # Application constants
└── types/         # TypeScript type definitions
```

### Backend Structure
```
server/
├── index.ts       # Express server entry point
├── routes.ts      # API route definitions
├── routes/        # Route handlers
├── storage.ts     # Data storage interface
└── vite.ts        # Vite development setup
```

## Key Features Implementation

### Audio System
- Multi-layered audio management with context awareness
- Cross-browser compatibility with fallback mechanisms
- Dynamic volume control based on user interactions

### Achievement System
- Gamified portfolio exploration mechanics
- Persistent progress tracking via localStorage
- Dynamic unlock conditions and notifications

### AI Character Integration
- ElevenLabs API integration for voice synthesis
- Context-aware dialogue system
- Real-time audio generation and caching

## Code Style Guidelines

- **TypeScript**: Strict typing enabled
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS with custom utilities
- **Animation**: Framer Motion for complex animations

## Testing

Current testing focuses on:
- Cross-browser audio compatibility
- API integration reliability
- Responsive design validation
- Performance optimization

## Deployment

The project supports multiple deployment platforms:
- **Vercel**: Serverless functions with edge runtime
- **Netlify**: Static site with serverless functions

## Performance Considerations

- Audio file optimization and compression
- Lazy loading for large assets
- API response caching strategies
- Bundle size optimization

## License

This project is developed for portfolio demonstration purposes.