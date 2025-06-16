# Diva Juan Interactive Portfolio

## Overview

This is an interactive portfolio application built as a Dark Souls-inspired character interaction experience. The application presents a mysterious character named "DIVA JUAN NUR TAQARRUB" who sits by a bonfire, and users can interact with him to explore his professional background, documents, and achievements. The project combines gaming aesthetics with professional portfolio presentation, featuring voice synthesis, dramatic effects, and an achievement system.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom Dark Souls-themed components
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Animations**: Framer Motion for smooth transitions and effects
- **State Management**: React Context API for audio and achievement state
- **Responsive Design**: Mobile-first approach with device-specific optimizations

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for server-side bundling
- **API Integration**: ElevenLabs voice synthesis API
- **File System**: Direct file operations for audio caching and asset management

### Key Components

#### Character Interaction System
- **Dialog Controller**: Manages conversation flow and character responses
- **Hover Dialog Controller**: Handles contextual responses based on user interactions
- **Idle Timeout Controller**: Implements escalating warnings and dramatic effects for user inactivity
- **Voice Synthesis**: ElevenLabs integration for character voice with caching system

#### Achievement System
- **Achievement Controller**: Tracks user progress and unlocks rewards
- **Local Storage**: Persistent achievement data across sessions
- **Achievement Types**: Multiple categories including interaction, exploration, and completion achievements
- **Visual Feedback**: Dark Souls-inspired achievement notifications with particle effects

#### Audio Management
- **Background Music**: Atmospheric Dark Souls-themed music
- **Ambient Sounds**: Fireplace crackling and environmental audio
- **Voice Synthesis**: Character dialogue with ElevenLabs API
- **Sound Effects**: Interactive feedback sounds for user actions

#### Document Viewing System
- **Contract Card**: Interactive document viewer for certificates and credentials
- **Image Optimization**: Responsive image handling with multiple formats
- **Zoom Controls**: User-friendly document navigation
- **Mobile Optimization**: Touch-friendly controls and responsive layouts

## Data Flow

1. **User Interaction**: User approaches the character or hovers over elements
2. **Controller Processing**: Appropriate controller (Dialog, Hover, or Idle) processes the interaction
3. **Response Generation**: System determines appropriate response based on context and user history
4. **Voice Synthesis**: Text is sent to ElevenLabs API for audio generation (with caching)
5. **Achievement Tracking**: User actions are evaluated for achievement unlocks
6. **State Updates**: UI components update based on new state
7. **Persistent Storage**: Achievement and interaction data saved to localStorage

## External Dependencies

### Core Technologies
- **React Ecosystem**: React 18, React DOM, React Router (via file-based routing)
- **TypeScript**: Full type safety across frontend and backend
- **Node.js Modules**: Express, fs, path for server operations
- **Build Tools**: Vite, esbuild, tsx for development and production builds

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Radix UI**: Headless UI components for accessibility
- **Framer Motion**: Animation library for smooth transitions
- **Lucide React**: Icon library for consistent iconography

### Audio and Media
- **ElevenLabs API**: Voice synthesis for character dialogue
- **HTML5 Audio**: Native audio playback for music and effects
- **Sharp**: Image optimization and processing (server-side)

### Development Tools
- **PostCSS**: CSS processing with Tailwind
- **Autoprefixer**: CSS vendor prefixing
- **Class Variance Authority**: Type-safe CSS class variants
- **clsx**: Conditional CSS class joining

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js and PostgreSQL modules
- **Hot Reload**: Vite development server with HMR
- **Port Configuration**: Development on port 5000
- **Environment Variables**: API keys loaded from .env files

### Production Build
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: esbuild bundles server code to `dist/index.js`
- **Asset Optimization**: Images and audio files processed for web delivery
- **Static Serving**: Express serves built client files in production

### Deployment Configuration
- **Target**: Replit autoscale deployment
- **Build Commands**: npm run build (builds both client and server)
- **Start Command**: npm run start (runs production server)
- **Port Mapping**: Internal port 5000 mapped to external port 80

## Changelog

- June 14, 2025. Initial setup
- June 14, 2025. Fixed dialog box race condition bug - prevented hover dialog text from being overridden by main dialog when user spams next/skip buttons
- June 16, 2025. Added easter egg reward system - when all 12 achievements are collected, a special reward button appears that redirects to Rick Astley's "Never Gonna Give You Up" as a Rick Roll surprise
- June 16, 2025. Added 21 variations for RETURN_DIALOG to make the character's responses more diverse when user returns after being thrown out
- June 16, 2025. Fixed Time Gizer achievement exploit - removed auto-completion logic that automatically granted "patience" achievement to users who reached final stages without waiting for FINAL_WARNING. Achievement now only unlocks through legitimate 9-minute idle timeout.
- June 16, 2025. Redesigned "curious observer" achievement system - HOVER_AFTER_RESET dialog now triggers first when user hovers over contract/social links, then unlocks achievement. Requirements: Digital Odyssey + Dream Escapist achievements OR hasBeenThrown + userHasBeenReturn flags. After completion, all main dialogs, hover dialogs, contract dialogs, and RETURN_DIALOG are disabled to provide a clean experience for users who have completed the achievement sequence.

## User Preferences

Preferred communication style: Simple, everyday language.