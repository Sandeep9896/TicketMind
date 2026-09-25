import mongoose from 'mongoose';
import env from './env.js';

const connectDB = async () => {
  await mongoose.connect(env.mongoUri);
};

export default connectDB;
