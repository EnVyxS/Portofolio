# Interactive Digital Portfolio

An advanced interactive digital portfolio built with React, TypeScript, and Framer Motion, featuring sophisticated animations and responsive design.

## Features

- **Interactive Contact Card**: Dynamic social media links with smooth positioning
- **Voice Integration**: ElevenLabs API for contextual audio interactions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Souls Inspired UI**: Elegant dark theme with golden accents
- **Advanced Animations**: Framer Motion powered smooth transitions
- **Dialog System**: Interactive conversation flow with intelligent responses

## Tech Stack

- **Frontend**: React 18, TypeScript, Framer Motion
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, Node.js
- **Database**: Drizzle ORM with PostgreSQL support
- **Build Tool**: Vite
- **Icons**: Lucide React, React Icons

## Deployment

### Netlify Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to Netlify:
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Deploy

### Environment Variables

Create a `.env` file for local development:
```
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

For production deployment, add environment variables in Netlify dashboard.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open [http://localhost:5000](http://localhost:5000)

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── views/        # Page components
│   │   └── controllers/  # Business logic
├── server/               # Express backend
├── shared/               # Shared types and schemas
├── netlify/              # Netlify functions
└── public/               # Static assets
```

## Key Components

- **GameContactCard**: Main contact interface with dynamic positioning
- **SocialLink**: Individual social media link component
- **DialogBox**: Interactive conversation system
- **ShareButton**: Content sharing functionality

## Responsive Breakpoints

- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px
- Landscape: Height < 500px

## Contact

Built by [Your Name] - [Your Email]

## License

MIT License