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
  const characterAudioDir = path.join(audioDir, 'character');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }
  if (!fs.existsSync(characterAudioDir)) {
    fs.mkdirSync(characterAudioDir, { recursive: true });
  }

  // Generate all missing whisper audio files
  app.post('/api/generate-all-whispers', async (req, res) => {
    try {
      // All whisper texts from the dream files
      const whisperTexts = [
        "help me",
        "it's cold here",
        "have you forgotten?",
        "we're still waiting",
        "come back to us",
        "remember the promise",
        "don't leave us again",
        "you abandoned us",
        "the fire is dying",
        "it's your fault",
        "we can see you",
        "behind you",
        "listen carefully",
        "you never escaped",
        "this isn't over",
        "do you hear it too?",
        "they're watching",
        "your shadow lied",
        "the door is open",
        "you were warned",
        "nothing is real",
        "i remember your face",
        "why did you run?",
        "closer... just a little closer",
        "we never stopped screaming",
        "you shouldn't have looked",
        "don't trust the light",
        "it breathes with you",
        "the silence is hungry",
        "we became the dark",
        "you are the last one",
        "time is breaking",
        "your name is fading",
        "this place remembers",
        "you are not alone… but you should be",
        "even the dead are afraid",
        "it's listening through you",
        "we still feel the fire",
        "your heartbeat lies",
        "we never died",
        "there is no way out",
        "we forgave you... once",
        "we are what's left",
        "open your eyes",
        "don't blink",
        "the sky is cracking",
        "it wants your name",
        "she never stopped crying",
        "they're not asleep",
        "you made us wait",
        "the walls are whispering too",
        "did you hear that?",
        "we were here first",
        "your skin remembers",
        "we know your thoughts",
        "stop pretending",
        "it sees through you",
        "your breath is not yours",
        "we're already inside",
        "the mirror lied",
        "you called us",
        "we never left",
        "we woke up for you",
        "you feel it crawling, don't you?",
        "you belong here now",
        "this isn't your dream",
        "we lost the way",
        "you forgot how it ends",
        "the ground is hollow",
        "you are repeating again",
        "shhh… it's almost here",
        "the stars are wrong",
        "you brought it with you",
        "where is your face?",
        "the cold remembers",
        "the whispers are growing",
        "you never had a choice",
        "don't listen to yourself",
        "it was always you",
        "something is missing",
        "you left it open",
        "we are all broken here",
        "your voice cracks too easily",
        "the silence is full of teeth",
        "you made it worse",
        "it's not over until you forget",
        "do you hear the scratching?",
        "it knows you're awake",
        "everything here is watching",
        "you forgot the ending",
        "something followed you",
        "they're inside the walls",
        "your dream is leaking",
        "we never wanted your help",
        "you left the door wide open",
        "it's waiting behind your eyes",
        "we loved you once",
        "it hates the light you carry",
        "you don't belong in this skin",
        "where did you bury us?",
        "the voices are multiplying",
        "your silence is too loud",
        "you let it in",
        "we miss the screaming",
        "you blinked too soon",
        "your hands aren't yours anymore",
        "you're becoming something else",
        "you keep waking up wrong",
        "it remembers your heartbeat",
        "don't close your eyes now",
        "you left a piece of you behind",
        "we were never human",
        "you dream in our language now",
        "the echoes are feeding",
        "you were warned—again and again",
        "your guilt stinks of fire",
        "you taste like regret",
        "we hear you breathing",
        "you are the crack in the mirror",
        "you promised us forever",
        "we whispered first",
        "it's learning your name",
        "don't let it answer",
        "you never came alone",
        "the floor is listening",
        "you opened it, now seal it",
        "we will finish what you started",
        "your reflection lied",
        "you'll never be clean again",
        "we remember the cold",
        "your dreams are infected",
        "you wrote this ending",
        "it's behind your thoughts",
        "we stitched your name into this place",
        "you walked into memory",
        "you made this real",
        "the air is thicker now",
        "you've been heard",
        "your silence gave it shape",
        "we're whispering through you",
        "it's almost your turn",
        "your teeth are falling out one by one",
        "the skin is peeling off your face",
        "maggots crawl through your veins",
        "your bones are cracking from within",
        "the spiders have made a nest in your skull",
        "your blood has turned to acid",
        "every breath you take is poison",
        "your heart beats backward",
        "the flesh melts from your fingers",
        "worms eat your thoughts",
        "your eyes are bleeding tears of glass",
        "the darkness lives in your lungs",
        "your soul is being devoured",
        "maggots feast on your memories",
        "your screams taste like copper",
        "the nightmare crawls inside your chest",
        "your sanity drips through your ears",
        "the voices grow louder when you try to sleep",
        "shadows dance behind your eyelids",
        "your pulse echoes in empty rooms",
        "the fear spreads like cancer",
        "every door leads to the same hell",
        "your name is written in blood on the walls",
        "the clock ticks backward to your death",
        "you smell like decomposing flowers",
        "the mirror cracks when you look at it",
        "your footsteps follow you",
        "the photographs move when you're not looking",
        "your laughter sounds like screaming",
        "the furniture rearranges itself at night",
        "you leave bloody handprints on everything",
        "the temperature drops when you enter",
        "electronics malfunction in your presence",
        "animals flee when they see you",
        "children cry when you're near",
        "plants wither at your touch",
        "milk sours in your vicinity",
        "lights flicker and die around you",
        "glass shatters in your wake",
        "metal rusts at your presence",
        "your shadow has no reflection",
        "you cast no reflection in water",
        "cameras can't capture your image",
        "recordings of your voice play backward",
        "your signature changes every time",
        "the ground cracks beneath your feet",
        "rain turns to blood when it touches you",
        "flowers bloom black in your garden",
        "the sun dims when you step outside",
        "birds fall dead from the sky",
        "the ocean recoils from your touch",
        "mountains crumble at your approach",
        "forests burn in your footsteps",
        "the earth trembles with your heartbeat",
        "gravity fails in your presence",
        "time stutters around you",
        "reality glitches when you move",
        "the universe folds to avoid you",
        "existence itself rejects you",
        "you are the anomaly that breaks everything",
        "you are the error in the code of life",
        "you are the virus in the system of reality",
        "you are the cancer in the body of existence",
        "you are the poison in the well of being",
        "you corrupt everything you touch",
        "you contaminate every space you enter",
        "you infect every mind you encounter",
        "you spread like a plague of despair",
        "you multiply like bacteria of suffering",
        "you reproduce like cells of misery",
        "you evolve into pure malevolence",
        "you adapt to cause maximum harm",
        "you survive to spread more pain",
        "you thrive on the destruction you cause",
        "you feed on the fear you generate",
        "you grow stronger with every scream",
        "you become more powerful with each tear",
        "you ascend through accumulated agony",
        "you transcend by consuming souls",
        "your whispers shatter glass and minds",
        "your footsteps leave burns in the earth",
        "your touch withers flesh and hope",
        "your gaze turns blood to ice",
        "your breath carries the stench of graves",
        "your voice makes the dead writhe",
        "your laughter cracks foundations",
        "your tears are acid that burns through souls",
        "your blood corrupts whatever it touches",
        "your hair moves like writhing serpents",
        "your nails grow into claws overnight",
        "your teeth sharpen while you sleep",
        "your skin grows scales in patches",
        "your eyes change color with your hunger",
        "your tongue splits and tastes fear",
        "your ears hear the screams of the unborn",
        "your nose smells the decay of the future",
        "your brain processes only suffering",
        "your heart pumps liquid terror",
        "your lungs breathe concentrated evil",
        "your stomach digests hope and joy",
        "your veins carry liquid nightmare",
        "your muscles contract with pure evil",
        "your bones hollow out and fill with screams",
        "your nerves conduct only pain signals",
        "your spine curves under the weight of sin",
        "your flesh mottles with death",
        "your scars form symbols of doom",
        "your wounds never heal properly",
        "your cuts spell out names of the dead",
        "your burns map territories of hell",
        "the insects that crawl from your mouth",
        "the worms that writhe in your ears",
        "the spiders that nest in your hair",
        "the rats that gnaw your dreams",
        "the cockroaches that scatter from your shadow",
        "the flies that swarm around your presence",
        "the beetles that burrow in your thoughts",
        "the moths that eat your memories",
        "the ants that march across your skin",
        "the termites that hollow out your soul",
        "the locusts that devour your happiness",
        "the wasps that sting your conscience",
        "the hornets that nest in your chest",
        "the parasites that control your thoughts",
        "the viruses that corrupt your data",
        "the bacteria that multiply your fears",
        "the fungus that grows from your despair",
        "the mold that spreads through your mind",
        "the cancer that blooms in your soul",
        "the tumors that speak in ancient tongues",
        "the cysts that contain compressed screams",
        "the mutations that make you less human",
        "the transformations that steal your identity",
        "the evolutions that drag you backward",
        "the adaptations that serve only darkness",
        "the changes that corrupt your essence",
        "the alterations that erase who you were",
        "the modifications that enhance your evil",
        "the chains that grow heavier each day",
        "the shackles that rust into your bones",
        "the manacles that fuse with your flesh",
        "the handcuffs that become part of you",
        "the restraints that define your existence",
        "the bindings that are woven from your sins",
        "the ropes that hang you slowly",
        "the nooses that tighten gradually",
        "the gallows that wait patiently",
        "the executioner that sharpens his blade",
        "the guillotine that calls your name",
        "the electric chair that hums with anticipation",
        "the gas chamber that fills with your fears",
        "the firing squad that loads with your regrets",
        "the lethal injection that flows with your guilt",
        "the final meal that tastes like ashes",
        "the last words that echo in emptiness",
        "the closing eyes that see only darkness",
        "the stopping heart that beats no more",
        "the final breath that carries no hope",
        "the ending that brings no peace",
        "the death that offers no release",
        "the afterlife that mirrors your hell",
        "the eternity that stretches endlessly",
        "the forever that knows no mercy",
        "the always that remembers every sin",
        "the never that forgives nothing",
        "the constant that is pure suffering",
        "the permanent that is absolute terror",
        "the immutable that offers no escape",
        "the unchanging that provides no relief",
        "the core that pulses with liquid evil",
        "the center that attracts only darkness",
        "the heart that beats with malevolent rhythm",
        "the soul that hungers for endless suffering",
        "the spirit that thirsts for pure terror",
        "the essence that craves absolute horror",
        "the being that exists only to cause pain",
        "the entity that lives to spread fear",
        "the creature that breathes to generate nightmare",
        "the thing that moves to multiply misery",
        "the you that has become everything you feared"
      ];

      // Check existing files
      const existingFiles = fs.readdirSync(characterAudioDir);
      const existingHashes = new Set();
      
      existingFiles.forEach(file => {
        if (file.startsWith('dialog_') && file.endsWith('.mp3')) {
          const hash = file.replace('dialog_', '').replace('.mp3', '');
          existingHashes.add(hash);
        }
      });

      let generated = 0;
      let skipped = 0;
      const total = whisperTexts.length;

      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked'
      });

      res.write(`Starting generation of ${total} whisper audio files...\n`);

      for (let i = 0; i < whisperTexts.length; i++) {
        const text = whisperTexts[i];
        const hash = Math.abs(text.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0));

        if (existingHashes.has(hash.toString())) {
          skipped++;
          res.write(`[${i + 1}/${total}] Skipped: "${text.substring(0, 50)}..." (already exists)\n`);
          continue;
        }

        try {
          const response = await fetch('http://localhost:5000/api/elevenlabs/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: text,
              voice_id: "Q5lUbL40rnWTcPncLVzc",
              model_id: "eleven_monolingual_v1",
              voice_settings: {
                stability: 0.4,
                similarity_boost: 0.8,
                style: 0.6,
                use_speaker_boost: true,
                speaking_rate: 0.9
              }
            })
          });

          const data = await response.json();
          if (data.success) {
            generated++;
            res.write(`[${i + 1}/${total}] Generated: "${text.substring(0, 50)}..."\n`);
          } else {
            res.write(`[${i + 1}/${total}] Failed: "${text.substring(0, 50)}..." - ${data.error}\n`);
          }
        } catch (error) {
          res.write(`[${i + 1}/${total}] Error: "${text.substring(0, 50)}..." - ${error.message}\n`);
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      res.write(`\nGeneration complete!\n`);
      res.write(`Total: ${total}\n`);
      res.write(`Generated: ${generated}\n`);
      res.write(`Skipped: ${skipped}\n`);
      res.end();

    } catch (error) {
      console.error('Error generating whisper audio:', error);
      res.status(500).json({ error: 'Failed to generate whisper audio' });
    }
  });

  // Generate all missing dialog audio files (idleDialog, HoverDialog, DialogController)
  app.post('/api/generate-all-dialogs', async (req, res) => {
    try {
      // All dialog texts from different controllers
      const allDialogs = [
        // Main DialogController dialogs
        "...Didn't ask for company.",
        "Fire's warm... Always brings strays....",
        "Haahhhh... You need something or are you just here to waste my time?",
        ".....",
        "Curiosity?... Hmph... Doesn't pay the bills...",
        "Pfftt... Waiting... Drinking... What else is there?",
        "A job?.., A way out?.., Some miracle?..",
        
        // Idle timeout dialogs
        "What the hell are you staring at?.. Got something to say!?",
        "You really gonna keep ignoring me? I'm not in the mood for this.",
        "You think this is funny?.. Staring at me for nine damn minutes?.. Fuck you!!",
        "Now what, you little filth!?.. Back for more punishment?",
        "Hmph... Finally, you decide to move... Suit yourself. You want to check it or just get on with signing the damn contract?",
        "KEEP PUSHING, AND YOU'LL REGRET IT.",
        "I'VE HAD ENOUGH OF YOUR GAMES!",
        
        // Hover dialog - interruption contact
        "Hmph... In a rush, are we? Fine. Tell me what you need done.",
        "Can't wait till I'm done talking? Fine. What do you want?",
        "Interrupting me? Rude. But I'm listening.",
        "Not even letting me finish? Fine, what's the contract?",
        "Hmm. Impatient, aren't you? What is it?",
        
        // Hover dialog - interruption social
        "Not listening, huh? Fine. Decide after you've checked.",
        "My story's boring you? Go on then, look elsewhere.",
        "Hmm. Distracted already? Go ahead, check it out.",
        "Prefer looking around than listening? Your choice.",
        "Lost interest so quickly? Whatever. Go look.",
        
        // Hover dialog - completed contact
        "Straight to the point—I like that. Fine. Give me the contract.",
        "Business it is then. What's the job?",
        "Contract details? Let's hear it.",
        "Talk business. I'm listening.",
        "Hmm. Cutting to the chase. Good.",
        
        // Hover dialog - completed social
        "Need to check first before deciding? Fine. Not like I'm in a hurry.",
        "Want to know more about me first? Suit yourself.",
        "Curious about my past work? Take a look.",
        "Checking my credentials? Smart. Not that I care.",
        "Due diligence, huh? Look all you want.",
        
        // Hover dialog - transition socialToContact
        "Took your time, didn't you? Fine. Hand me the damn contract.",
        "Done looking? Ready for business now?",
        "Satisfied with what you found? Let's talk work.",
        "Seen enough? What's the job then?",
        "Research complete? Let's hear about the contract.",
        
        // Hover dialog - transition contactToSocial
        "Fine. Go ahead, check it first.",
        "Having second thoughts? Look around then.",
        "Changed your mind? Go on, look me up.",
        "Not convinced yet? See for yourself.",
        "Hmm. Still uncertain? Check my background.",
        
        // Hover dialog - annoyance firstLevel
        "Talk... You got a job, or just wasting my time?",
        "Make up your mind. I don't have all day.",
        "Hmm. This back and forth is getting irritating.",
        "Decide already. Contract or not?",
        "Getting annoyed with the indecision here.",
        
        // Hover dialog - annoyance secondLevel
        "Arghh... whatever you want. I'm done.",
        "That's it. I'm done with this nonsense.",
        "Enough of this. Make a choice or leave me be.",
        "HAHH...I've lost my patience. We're done here.",
        "I'm through with this game. Decide or go away.",
        
        // Contract responses
        "Now you've seen the proof. Are we good to continue, or do you need more convincing?",
        "That should answer your questions about my background. Ready to talk about something else now?",
        "There's everything you needed to see. I'm the real deal. What would you like to discuss next?"
      ];

      // Check existing files
      const existingFiles = fs.readdirSync(characterAudioDir);
      const existingHashes = new Set();
      
      existingFiles.forEach(file => {
        if (file.startsWith('dialog_') && file.endsWith('.mp3')) {
          const hash = file.replace('dialog_', '').replace('.mp3', '');
          existingHashes.add(hash);
        }
      });

      let generated = 0;
      let skipped = 0;
      const total = allDialogs.length;

      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked'
      });

      res.write(`Starting generation of ${total} dialog audio files...\n`);

      for (let i = 0; i < allDialogs.length; i++) {
        const text = allDialogs[i];
        
        // Skip empty dialogs
        if (!text || text.trim() === '' || text.trim() === '.....') {
          skipped++;
          res.write(`[${i + 1}/${total}] Skipped: "${text}" (empty or dots only)\n`);
          continue;
        }
        
        const hash = Math.abs(text.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0));

        if (existingHashes.has(hash.toString())) {
          skipped++;
          res.write(`[${i + 1}/${total}] Skipped: "${text.substring(0, 50)}..." (already exists)\n`);
          continue;
        }

        try {
          const response = await fetch('http://localhost:5000/api/elevenlabs/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: text,
              voice_id: "dBynzNhvSFj0l1D7I9yV", // DIVA JUAN voice ID
              model_id: "eleven_monolingual_v1",
              voice_settings: {
                stability: 0.9,
                similarity_boost: 1.0,
                style: 0.25,
                use_speaker_boost: true,
                speaking_rate: 0.95
              }
            })
          });

          const data = await response.json();
          if (data.success) {
            generated++;
            res.write(`[${i + 1}/${total}] Generated: "${text.substring(0, 50)}..."\n`);
          } else {
            res.write(`[${i + 1}/${total}] Failed: "${text.substring(0, 50)}..." - ${data.error}\n`);
          }
        } catch (error) {
          res.write(`[${i + 1}/${total}] Error: "${text.substring(0, 50)}..." - ${error.message}\n`);
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      res.write(`\nDialog generation complete!\n`);
      res.write(`Total: ${total}\n`);
      res.write(`Generated: ${generated}\n`);
      res.write(`Skipped: ${skipped}\n`);
      res.end();

    } catch (error) {
      console.error('Error generating dialog audio:', error);
      res.status(500).json({ error: 'Failed to generate dialog audio' });
    }
  });

  // Generate all missing RETURN_DIALOG audio files
  app.post('/api/generate-return-dialogs', async (req, res) => {
    try {
      // All RETURN_DIALOG variations from dialogModel.ts
      const returnDialogs = [
        "[menacing] Now what, you little filth!?.. [threatening] Back for more punishment?",
        "You just don't learn, do you?",
        "Thought you'd had enough. Guess I was wrong.",
        "Back on your feet already? You're persistent, I'll give you that.",
        "I don't have time for this. But if you insist...",
        "Still breathing? Impressive. Stupid, but impressive.",
        "You should've stayed down.",
        "I warned you once. That was your mercy.",
        "You mistake survival for strength. Let me fix that.",
        "Back again? Your pain threshold must be as low as your wit.",
        "This isn't bravery. It's desperation… or stupidity.",
        "You bleed easy. Let's see how long before you break.",
        "Still standing? I'll make that regret last.",
        "You came all this way just to die tired.",
        "You had your chance. Now I take mine.",
        "Last time was a warning. This time, it's a lesson.",
        "You're not a challenge. You're an inconvenience.",
        "You came back. Brave… or foolish?",
        "Some people never know when to quit.",
        "Fine. One more lesson. Then it ends.",
        "Didn't think you'd crawl back so soon. But here we are."
      ];

      // Check existing files
      const existingFiles = fs.readdirSync(characterAudioDir);
      const existingHashes = new Set();
      
      existingFiles.forEach(file => {
        if (file.startsWith('dialog_') && file.endsWith('.mp3')) {
          const hash = file.replace('dialog_', '').replace('.mp3', '');
          existingHashes.add(hash);
        }
      });

      let generated = 0;
      let skipped = 0;
      const total = returnDialogs.length;

      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked'
      });

      res.write(`Starting generation of ${total} RETURN_DIALOG audio files...\n`);

      for (let i = 0; i < returnDialogs.length; i++) {
        const text = returnDialogs[i];
        
        // Clean the text by removing stage directions in brackets
        const cleanText = text.replace(/\[.*?\]/g, '').trim();
        
        const hash = Math.abs(cleanText.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0));

        if (existingHashes.has(hash.toString())) {
          skipped++;
          res.write(`[${i + 1}/${total}] Skipped: "${cleanText.substring(0, 50)}..." (already exists)\n`);
          continue;
        }

        try {
          const response = await fetch('http://localhost:5000/api/elevenlabs/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: cleanText,
              voice_id: "dBynzNhvSFj0l1D7I9yV", // DIVA JUAN voice ID
              model_id: "eleven_monolingual_v1",
              voice_settings: {
                stability: 0.9,
                similarity_boost: 1.0,
                style: 0.25,
                use_speaker_boost: true,
                speaking_rate: 0.95
              }
            })
          });

          const data = await response.json();
          if (data.success) {
            generated++;
            res.write(`[${i + 1}/${total}] Generated: "${cleanText.substring(0, 50)}..."\n`);
          } else {
            res.write(`[${i + 1}/${total}] Failed: "${cleanText.substring(0, 50)}..." - ${data.error}\n`);
          }
        } catch (error) {
          res.write(`[${i + 1}/${total}] Error: "${cleanText.substring(0, 50)}..." - ${error.message}\n`);
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      res.write(`\nRETURN_DIALOG generation complete!\n`);
      res.write(`Total: ${total}\n`);
      res.write(`Generated: ${generated}\n`);
      res.write(`Skipped: ${skipped}\n`);
      res.end();

    } catch (error) {
      console.error('Error generating return dialog audio:', error);
      res.status(500).json({ error: 'Failed to generate return dialog audio' });
    }
  });
  
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
