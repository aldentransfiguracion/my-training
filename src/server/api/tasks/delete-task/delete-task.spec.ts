import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, User } from '../../../../../prisma/client';

describe('Delete task', () => {
  let requestingUser: User;
  let deleteTask: ReturnType<
    typeof appRouter.createCaller
  >['tasks']['deleteTask'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: [],
        roles: [],
      }),
    });
    deleteTask = appRouter
      .createCaller({ userId: requestingUser.id })
      .tasks
      .deleteTask;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });
});