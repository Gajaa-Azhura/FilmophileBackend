// Script to find and fix or delete broken films in the database
import mongoose from 'mongoose';
import Film from './models/Films.js';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/filmophile';

async function fixOrDeleteBrokenFilms() {
  await mongoose.connect(mongoUri);
  const films = await Film.find({
    $or: [
      { videoUrl: { $exists: false } },
      { videoUrl: null },
      { uploadedBy: { $exists: false } },
      { uploadedBy: null },
      { thumbnailUrl: { $exists: false } },
      { thumbnailUrl: null }
    ]
  });
  if (films.length === 0) {
    console.log('No broken films found.');
    process.exit(0);
  }
  for (const film of films) {
    console.log('Broken film:', film._id, film.title);
    // Option 1: Delete
    await Film.deleteOne({ _id: film._id });
    // Option 2: To fix, you could update here instead of deleting
    // await Film.updateOne({ _id: film._id }, { $set: { videoUrl: '...', uploadedBy: '...', thumbnailUrl: '...' } });
    console.log('Deleted.');
  }
  process.exit(0);
}

fixOrDeleteBrokenFilms().catch(err => { console.error(err); process.exit(1); });
