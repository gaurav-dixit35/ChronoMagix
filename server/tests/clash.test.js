import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';
import { signToken } from '../utils/jwt.js';

let mongo;
let admin;
let instructorA;
let instructorB;
let courseA;
let courseB;
let adminToken;
let tokenA;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Course.deleteMany({}), Lecture.deleteMany({})]);
  await Lecture.syncIndexes();
  [admin, instructorA, instructorB] = await User.create([
    { name: 'Admin User', email: 'admin@test.com', password: 'password1', role: 'admin' },
    { name: 'Rahul Sharma', email: 'rahul@test.com', password: 'password1', role: 'instructor' },
    { name: 'Priya Nair', email: 'priya@test.com', password: 'password1', role: 'instructor' },
  ]);
  [courseA, courseB] = await Course.create([
    { name: 'Course Alpha', level: 'Beginner', description: 'Course description long enough.', image: 'data:image/png;base64,AA==' },
    { name: 'Course Beta', level: 'Intermediate', description: 'Another course description.', image: 'data:image/png;base64,AA==' },
  ]);
  adminToken = signToken(admin.id);
  tokenA = signToken(instructorA.id);
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });

const addLecture = (token, course, instructor, date) => request(app).post(`/api/courses/${course}/lectures`).set('Authorization', `Bearer ${token}`).send({ instructorId: instructor, date });

describe('instructor date clash guarantee', () => {
  it('allows first booking, rejects cross-course clash, permits another instructor and another date', async () => {
    expect((await addLecture(adminToken, courseA.id, instructorA.id, '2026-12-01')).status).toBe(201);
    const clash = await addLecture(adminToken, courseB.id, instructorA.id, '2026-12-01');
    expect(clash.status).toBe(409);
    expect(clash.body.code).toBe('INSTRUCTOR_DATE_CLASH');
    expect((await addLecture(adminToken, courseB.id, instructorB.id, '2026-12-01')).status).toBe(201);
    expect((await addLecture(adminToken, courseB.id, instructorA.id, '2026-12-02')).status).toBe(201);
  });
  it('race-proofs concurrent requests with the unique compound index', async () => {
    const results = await Promise.all([
      addLecture(adminToken, courseA.id, instructorA.id, '2026-12-03'),
      addLecture(adminToken, courseB.id, instructorA.id, '2026-12-03'),
    ]);
    expect(results.map(x => x.status).sort()).toEqual([201, 409]);
    const indexList = await Lecture.collection.indexes();
    process.stdout.write(`Lecture index list: ${JSON.stringify(indexList)}\n`);
    expect(indexList.some(x => x.key.instructor === 1 && x.key.date === 1 && x.unique)).toBe(true);
  });
  it('rejects invalid calendar dates', async () => {
    const response = await addLecture(adminToken, courseA.id, instructorA.id, '2026-02-30');
    expect(response.status).toBe(400);
  });
  it('updates dates with clash checks and permits a free date', async () => {
    await addLecture(adminToken, courseA.id, instructorA.id, '2026-12-04');
    await addLecture(adminToken, courseA.id, instructorA.id, '2026-12-05');
    const lecture = await Lecture.findOne({ instructor: instructorA.id });
    const conflict = await request(app).patch(`/api/lectures/${lecture.id}`).set('Authorization', `Bearer ${adminToken}`).send({ date: '2026-12-05' });
    expect(conflict.status).toBe(409);
    const free = await request(app).patch(`/api/lectures/${lecture.id}`).set('Authorization', `Bearer ${adminToken}`).send({ date: '2026-12-06' });
    expect(free.status).toBe(200);
  });
  it('denies instructor admin access and scopes their lecture list', async () => {
    expect((await request(app).get('/api/instructors').set('Authorization', `Bearer ${tokenA}`)).status).toBe(403);
    await addLecture(adminToken, courseA.id, instructorA.id, '2026-12-07');
    await addLecture(adminToken, courseB.id, instructorB.id, '2026-12-08');
    const own = await request(app).get('/api/instructor/lectures').set('Authorization', `Bearer ${tokenA}`);
    expect(own.status).toBe(200);
    expect(own.body.data).toHaveLength(1);
    expect(String(own.body.data[0].instructor)).toBe(instructorA.id);
  });
});
