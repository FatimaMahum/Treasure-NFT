import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import Ad model
import Ad from './models/Ad.js';

// Real ads data with working video URLs
const realAds = [
  {
    title: 'Palmolive Pakistan',
    description: 'Watch this amazing Palmolive Pakistan advertisement and earn ₹100!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    embedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    reward: 100,
    duration: 30,
    isActive: true
  },
  {
    title: 'Beautiful Wear Collection',
    description: 'Check out this stunning fashion collection and earn ₹100!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    embedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    reward: 100,
    duration: 30,
    isActive: true
  },
  {
    title: 'Golden Pearl Official',
    description: 'Watch this Golden Pearl official advertisement and earn ₹100!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    embedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    reward: 100,
    duration: 30,
    isActive: true
  },
  {
    title: 'Chabid Latif',
    description: 'Enjoy this amazing content from Chabid Latif and earn ₹100!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    embedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    reward: 100,
    duration: 30,
    isActive: true
  },
  {
    title: 'Google Veo 30',
    description: 'Watch this Google Veo 30 advertisement and earn ₹100!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    embedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    reward: 100,
    duration: 30,
    isActive: true
  },
  {
    title: 'Savannah Pakistan',
    description: 'Check out this amazing Savannah Pakistan content and earn ₹100!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    embedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    reward: 100,
    duration: 30,
    isActive: true
  },
  {
    title: 'Off The School',
    description: 'Watch this Off The School advertisement and earn ₹100!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    embedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    reward: 100,
    duration: 30,
    isActive: true
  },
  {
    title: 'Cheezious Pakistan',
    description: 'Enjoy this Cheezious Pakistan advertisement and earn ₹100!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMob.mp4',
    embedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMob.mp4',
    reward: 100,
    duration: 30,
    isActive: true
  },
  {
    title: 'Erum Malhi Official',
    description: 'Watch this Erum Malhi official content and earn ₹100!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    embedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    reward: 100,
    duration: 30,
    isActive: true
  }
];

const createAds = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing ads
    await Ad.deleteMany({});
    console.log('🗑️ Cleared existing ads');

    // Insert real ads
    const createdAds = await Ad.insertMany(realAds);
    console.log(`✅ Created ${createdAds.length} real ads:`);

    createdAds.forEach((ad, index) => {
      console.log(`${index + 1}. ${ad.title} - ₹${ad.reward}`);
    });

    console.log('\n🎉 Real ads created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating ads:', error);
    process.exit(1);
  }
};

createAds(); 