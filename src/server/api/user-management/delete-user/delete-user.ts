import { z } from 'zod/v4';
import { prisma } from '../../../../../prisma/client';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '../../trpc';
import { isPrismaError } from '../../../utils/prisma';

const deleteUserInput = z.object({
  userId: z.string(),
});

const deleteUserOutput = z.void();

export const deleteUser = authorizedProcedure
  .meta({ requiredPermissions: ['manage-users-full-access'] })
  .input(deleteUserInput)
  .output(deleteUserOutput)
  .mutation(async opts => {
    try {
      await prisma.user.delete({ where: { id: opts.input.userId } });
    } catch (err) {
      if (isPrismaError(err, 'NOT_FOUND')) {
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }
      throw err;
    }
  });
