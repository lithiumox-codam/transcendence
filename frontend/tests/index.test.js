import pactum from 'pactum';

describe('User', () => {
  const user_data = {
    email: 'user1@test.com',
    username: 'user1',
    password: 'Password123!'
  };

  before(() => {
    pactum.request.setBaseUrl('http://localhost:8080');
  });

  describe('Sign up', () => {
    it('should return 401', async () => {
      await pactum.spec()
        .get('/api/user/profile/')
        .expectStatus(401)
    });

    it('Create User', async () => {
      await pactum.spec()
        .post('/api/auth/signup/')
        .withJson(user_data)
        .expectStatus(201)
        .stores('user', 'access')
    });

    it('should return 200', async () => {
      await pactum.spec()
        .get('/api/user/profile/')
        .withHeaders({
          Authorization: 'Bearer $S{user}',
        })
        .expectStatus(200)
    });
  });

  describe('Login', () => {
    it('Login User', async () => {
      await pactum.spec()
        .post('/api/auth/login/')
        .withJson({
          username: user_data.username,
          password: user_data.password
        })
        .expectStatus(200)
        .stores('user', 'access')
    })

    it('should return 200', async () => {
      await pactum.spec()
        .get('/api/user/profile/')
        .withHeaders({
          Authorization: 'Bearer $S{user}',
        })
        .expectStatus(200);
    });
  });

  // Test Uploading Avatar
  describe('Avatar', () => {
    it('Should return 401', async () => {
      await pactum.spec()
        .post('/api/user/avatar/')
        .expectStatus(401)
    });

    it('Upload Avatar', async () => {
      await pactum.spec()
        .post('/api/user/avatar/')
        .withHeaders({
          Authorization: 'Bearer $S{user}',
        })
        .withFile('avatar', 'tests/avatar.png')
        .expectStatus(200)
    });
  });
});
