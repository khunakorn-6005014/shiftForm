import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';       
import Shift from '../models/shift.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // clear all collections
  await Shift.deleteMany({});
});

describe('Shift API', () => {
  let createdId;

  it('GET  /api/shifts → [] when empty', async () => {
    const res = await request(app).get('/api/shifts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/shifts → creates a shift', async () => {
    const payload = {
      user:       'alice',
      date:       '2025-07-20',
      startTime:  '08:00',
      endTime:    '16:00',
      hourlyWage: 25,
      place:      'Office',
      slug:       'alice-mon-0800',
      comments:   'Test shift'
    };

    const res = await request(app)
      .post('/api/shifts')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.shift).toMatchObject({
      user:       'alice',
      date:       expect.any(String),      // ISO date
      startTime:  '08:00',
      endTime:    '16:00',
      hourlyWage: 25,
      place:      'Office',
      slug:       'alice-mon-0800',
      comments:   'Test shift'
    });
    createdId = res.body.shift._id;
  });

  it('GET  /api/shifts/:id → returns the created shift', async () => {
    // first create one
    const { body } = await request(app).post('/api/shifts').send({
      user: 'bob',
      date: '2025-07-21',
      startTime: '09:00',
      endTime: '17:00',
      hourlyWage: 30,
      place: 'Warehouse',
      slug: 'bob-tue-0900'
    });
    const id = body.shift._id;

    const res = await request(app).get(`/api/shifts/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ slug: 'bob-tue-0900' });
  });

  it('PATCH /api/shifts/:id → updates a shift', async () => {
    // create
    const { body } = await request(app).post('/api/shifts').send({
      user: 'carol',
      date: '2025-07-22',
      startTime: '10:00',
      endTime: '18:00',
      hourlyWage: 28,
      place: 'Remote',
      slug: 'carol-wed-1000'
    });
    const id = body.shift._id;

    // update wage
    const res = await request(app)
      .patch(`/api/shifts/${id}`)
      .send({ hourlyWage: 32 });

    expect(res.status).toBe(200);
    expect(res.body.hourlyWage).toBe(32);
  });

  it('DELETE /api/shifts/:id → rejects non-admin, then allows admin', async () => {
    // create
    const { body } = await request(app).post('/api/shifts').send({
      user: 'dave',
      date: '2025-07-23',
      startTime: '07:00',
      endTime: '15:00',
      hourlyWage: 22,
      place: 'Office',
      slug: 'dave-thu-0700'
    });
    const id = body.shift._id;

    // without admin header
    let res = await request(app).delete(`/api/shifts/${id}`);
    expect(res.status).toBe(403);

    // with admin header
    res = await request(app)
      .delete(`/api/shifts/${id}`)
      .set('x-admin', 'true');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: 'Shift deleted' });

    // confirm it’s gone
    const all = await request(app).get('/api/shifts');
    expect(all.body).toHaveLength(0);
  });
});