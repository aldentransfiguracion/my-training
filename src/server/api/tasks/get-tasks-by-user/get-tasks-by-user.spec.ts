import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, User } from '../../../../../prisma/client';

describe('Get tasks by user', () => {
  let requestingUser: User;
  let getTasksByUser: ReturnType<
    typeof appRouter.createCaller
  >['tasks']['getTasksByUser'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-tasks'],
        roles: ['user'],
      }),
    });
    getTasksByUser = appRouter
      .createCaller({ userId: requestingUser.id })
      .tasks
      .getTasksByUser;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });

  it('gets the tasks', async () => {
    const total = 5;
    const page = 3;

    const tasks = await prisma.task.createManyAndReturn({
      data: Array.from(
        { length: total },
        () => ({
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
          ownerId: requestingUser.id,
        })
      )
    })

    try {
      const taskResponse = await getTasksByUser({
        pageSize: 10,
        pageOffset: 0,
      });
      //verify that the tasks are returned by the procedure
      expect(taskResponse).toHaveProperty('totalCount', total);
      expect(taskResponse.data.length).toBe(total);
    } finally {
      await prisma.task.deleteMany({
        where: {
          id: { in: tasks.map(task => task.id) }
        }
      });
    }
  });

  it('errors on bad pagination', async () => {
    const total = 5;
    const page = 3;

    const tasks = await prisma.task.createManyAndReturn({
      data: Array.from(
        { length: total },
        () => ({
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
          ownerId: requestingUser.id,
        })
      )
    })

    let error;
    try {
      const taskResponse = await getTasksByUser({
        pageSize: page,
        pageOffset: total,
      });
    } catch (e) {
      error = e;
    } finally {
      await prisma.task.deleteMany({
        where: {
          id: { in: tasks.map(task => task.id) }
        }
      });
    }
    expect(error).toHaveProperty('code', 'BAD_REQUEST');
  });

  it('returns empty if empty database', async () => {
    const result = await getTasksByUser({ pageSize: 10, pageOffset: 0 });
  
    expect(result).toHaveProperty('totalCount', 0);
    expect(result.data).length(0);
  });
  
});