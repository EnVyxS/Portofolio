import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from 'fs';
import path from 'path';
import elevenlabsRoutes from './routes/elevenlabs';

export async function registerRoutes(app: Express): Promise<Server> {
  // Register the ElevenLabs API routes
  app.use('/api/elevenlabs', elevenlabsRoutes);
  
  // Create the public directory for audio files if it doesn't exist
  const audioDir = path.join(process.cwd(), 'client/public/audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }
  
  // Copy the audio file from the assets to the public directory for client access
  try {
    const sourceAudio = path.join(process.cwd(), 'attached_assets/Darksouls-Chill.m4a');
    const targetAudio = path.join(audioDir, 'darksouls-chill.mp3');
    
    // Only copy if the target doesn't exist
    if (fs.existsSync(sourceAudio) && !fs.existsSync(targetAudio)) {
      fs.copyFileSync(sourceAudio, targetAudio);
      console.log('Audio file copied successfully');
    }
  } catch (error) {
    console.error('Error copying audio file:', error);
  }

  const httpServer = createServer(app);

  return httpServer;
}
