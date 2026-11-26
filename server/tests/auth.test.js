import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';

let mongo;
beforeAll(async () => { mongo = await MongoMemoryServer.create(); await mongoose.connect(mongo.getUri()); });
beforeEach(async () => { await User.deleteMany({}); await User.create({ name: 'Admin User', email: 'admin@test.com', password: 'password1', role: 'admin' }); });
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });
it('logs in with a bcrypt password and returns safe user fields', async () => {
  const response = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'password1' });
  expect(response.status).toBe(200);
  expect(response.body.data.token).toBeTruthy();
  expect(response.body.data.user.email).toBe('admin@test.com');
  expect(response.body.data.user.password).toBeUndefined();
});
it('returns a clear error for incorrect credentials', async () => {
  const response = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'wrongpass' });
  expect(response.status).toBe(401);
  expect(response.body.message).toBe('Email or password is incorrect.');
});
