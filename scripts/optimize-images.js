import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '..', 'attached_assets');
const outputDir = path.join(__dirname, '..', 'public', 'optimized_assets');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all jpg files from source directory
const imageFiles = fs.readdirSync(sourceDir).filter(file => file.endsWith('.jpg'));

// Settings for optimization
const jpgOptions = {
  quality: 80,
  progressive: true,
  optimizeScans: true
};

// Process each image
async function optimizeImages() {
  console.log(`Found ${imageFiles.length} images to optimize`);
  
  for (const file of imageFiles) {
    const inputPath = path.join(sourceDir, file);
    const outputPath = path.join(outputDir, file);
    
    try {
      // Get image info first
      const metadata = await sharp(inputPath).metadata();
      console.log(`Processing: ${file} - Original size: ${Math.round(fs.statSync(inputPath).size / 1024)}KB`);
      
      // If image is very large, resize it to a reasonable size while maintaining aspect ratio
      let sharpInstance = sharp(inputPath);
      
      // Only resize if the image is larger than 1800px on any dimension
      if (metadata.width > 1800 || metadata.height > 1800) {
        sharpInstance = sharpInstance.resize({
          width: Math.min(metadata.width, 1800),
          height: Math.min(metadata.height, 1800),
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // Optimize and save
      await sharpInstance
        .jpeg(jpgOptions)
        .toFile(outputPath);
      
      const newSize = Math.round(fs.statSync(outputPath).size / 1024);
      const reduction = Math.round((1 - newSize / (fs.statSync(inputPath).size / 1024)) * 100);
      console.log(`Optimized: ${file} - New size: ${newSize}KB (${reduction}% reduction)`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  console.log('Optimization complete!');
}

optimizeImages().catch(err => {
  console.error('Optimization failed:', err);
  process.exit(1);
});