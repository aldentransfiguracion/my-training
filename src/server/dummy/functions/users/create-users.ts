import { makeDummy } from '@fhss-web-team/backend-utils';
import z from 'zod/v4';
import { generateDummyUserData } from '../../helpers/dummy-user';
import { prisma } from '../../../../../prisma/client';
import { DEFAULT_ROLE } from '../../../../security';

export const createUsers = makeDummy({
  name: 'Create users',
  description: 'Creates a bunch of users (defaults to 10).',
  inputSchema: z.object({ count: z.number().default(10) }),
  handler: async (data) => {
    const userData = Array.from({ length: data.count }, () =>
      generateDummyUserData(),
    ).map((usr) => ({
      ...usr,
      roles: DEFAULT_ROLE ? [DEFAULT_ROLE] : undefined,
    }));
    return await prisma.user.createManyAndReturn({ data: userData });
  },
});
