import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { after, before, describe, it } from 'node:test';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  before(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  after(async () => {
    await app.close();
  });

  it('/api/check-token (GET)', async () => {
    await request(app.getHttpServer())
      .get('/api/check-token')
      .expect(403);
  });
});
