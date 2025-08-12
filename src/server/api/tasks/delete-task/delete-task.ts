import { z } from 'zod/v4';
import { prisma } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';
import { isPrismaError } from '../../../utils/prisma';
import { TRPCError } from '@trpc/server';

const deleteTaskInput = z.object({
  taskId: z.string(),
});

const deleteTaskOutput = z.void();

export const deleteTask = authorizedProcedure
  .meta({ requiredPermissions: ['manage-tasks'] })
  .input(deleteTaskInput)
  .output(deleteTaskOutput)
  .mutation(async (opts) => {
    try{
    await prisma.task.delete({
      where: {
        id: opts.input.taskId,
        ownerId: opts.ctx.userId,
      },
    });
  } catch (e) {
    if (isPrismaError(e, 'NOT_FOUND')) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
    }
    throw e;
  }
  });
