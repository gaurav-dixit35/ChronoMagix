import mongoose from 'mongoose';

/** Open the shared MongoDB connection and return it for orderly shutdown. */
export async function connectDatabase(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: process.env.NODE_ENV !== 'production' });
  return mongoose.connection;
}

/** Close the shared MongoDB connection. */
export async function disconnectDatabase() {
  await mongoose.disconnect();
}
