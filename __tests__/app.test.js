const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
// const { request } = require('express');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/userService.js');

const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@test.com',
  password: '123456',
};

const registerLogin = async (userProps = {}) => {
  const password = userProps.password ?? testUser.password;
  const agent = request.agent(app);
  const user = await UserService.create({ ...testUser, ...userProps });
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('Top Secret Routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('create a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(testUser);
    const { firstName, lastName, email } = testUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });
  it('returns current user', async () => {
    const [agent, user] = await registerLogin();
    const me = await agent.get('/api/v1/users/me');

    expect(me.body).toEqual({
      ...user,
      id: expect.any(String),
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });

  it('DELETE should return 401 error', async () => {
    const res = await request(app).get('/api/v1/users');

    expect(res.body).toEqual({
      message: 'You must be signed in to continue',
      status: 401,
    });
  });
  it('should GET all secrets if a user is signed in', async () => {
    const [agent] = await registerAndLogin();
    const res = await agent.get('/api/v1/secrets');
    expect(res.status).toBe(200);
    expect(res.body).toMatchInlineSnapshot();
  });
  afterAll(() => {
    pool.end();
  });
});
