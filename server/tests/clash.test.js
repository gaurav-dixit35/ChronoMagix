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
    { name: 'Gaurav Dixit', email: 'gaurav@test.com', password: 'password1', role: 'instructor' },
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
  it('rejects unsupported uploads and images over the size limit', async () => {
    const unsupported = await request(app).post('/api/courses').set('Authorization', `Bearer ${adminToken}`)
      .attach('image', Buffer.from('not an image'), { filename: 'notes.txt', contentType: 'text/plain' });
    expect(unsupported.status).toBe(400);
    const oversized = await request(app).post('/api/courses').set('Authorization', `Bearer ${adminToken}`)
      .attach('image', Buffer.alloc((2 * 1024 * 1024) + 1), { filename: 'large.png', contentType: 'image/png' });
    expect(oversized.status).toBe(413);
  });
  it('supports admin course, availability and lecture API workflows', async () => {
    const created = await request(app).post('/api/courses').set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Course Created by API').field('level', 'Beginner')
      .field('description', 'A course created by the backend API test.')
      .attach('image', Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), { filename: 'course.png', contentType: 'image/png' });
    expect(created.status).toBe(201);
    const courseId = created.body.data._id;
    const updated = await request(app).put(`/api/courses/${courseId}`).set('Authorization', `Bearer ${adminToken}`).send({ description: 'The updated course description is long enough.' });
    expect(updated.status).toBe(200);
    const lecture = await addLecture(adminToken, courseId, instructorA.id, '2026-12-11');
    expect(lecture.status).toBe(201);
    const availability = await request(app).get('/api/instructors/availability?date=2026-12-11').set('Authorization', `Bearer ${adminToken}`);
    expect(availability.body.data.find((user) => user.id === instructorA.id)).toMatchObject({ available: false, bookedCourse: 'Course Created by API' });
    const filtered = await request(app).get(`/api/lectures?courseId=${courseId}&from=2026-12-11&to=2026-12-11`).set('Authorization', `Bearer ${adminToken}`);
    expect(filtered.body.data).toHaveLength(1);
    const detail = await request(app).get(`/api/courses/${courseId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(detail.body.data.lectures).toHaveLength(1);
    expect((await request(app).delete(`/api/courses/${courseId}`).set('Authorization', `Bearer ${adminToken}`)).status).toBe(200);
    expect(await Lecture.countDocuments({ course: courseId })).toBe(0);
  });
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
  it('returns lecture detail for edit screens and excludes its own booking from availability', async () => {
    const created = await addLecture(adminToken, courseA.id, instructorA.id, '2026-12-12');
    const lectureId = created.body.data._id;
    const detail = await request(app).get(`/api/lectures/${lectureId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(detail.status).toBe(200);
    expect(String(detail.body.data.instructor._id)).toBe(instructorA.id);
    const availability = await request(app).get(`/api/instructors/availability?date=2026-12-12&excludeLectureId=${lectureId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(availability.body.data.find(({ id }) => String(id) === instructorA.id).available).toBe(true);
  });
  it('rejects changing to a busy instructor and permits an available instructor', async () => {
    await addLecture(adminToken, courseA.id, instructorA.id, '2026-12-09');
    await addLecture(adminToken, courseA.id, instructorB.id, '2026-12-09');
    const lecture = await Lecture.findOne({ instructor: instructorA.id });
    const conflict = await request(app).patch(`/api/lectures/${lecture.id}`).set('Authorization', `Bearer ${adminToken}`).send({ instructorId: instructorB.id });
    expect(conflict.status).toBe(409);
    expect(conflict.body.code).toBe('INSTRUCTOR_DATE_CLASH');
    const available = await request(app).patch(`/api/lectures/${lecture.id}`).set('Authorization', `Bearer ${adminToken}`).send({ instructorId: instructorA.id, date: '2026-12-10' });
    expect(available.status).toBe(200);
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
