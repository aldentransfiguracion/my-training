import { z } from 'zod/v4';
import { prisma } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';

const createTaskInput = z.object({
  title: z.string(),
  description: z.string(),
});

const createTaskOutput = z.object({
  taskId: z.string(),
});

export const createTask = authorizedProcedure
  .meta({ requiredPermissions: ['manage-tasks'] })
  .input(createTaskInput)
  .output(createTaskOutput)
  .mutation(async (opts) => {
    const task = await prisma.task.create({
      data: {
        title: opts.input.title,
        description: opts.input.description,
        ownerId: opts.ctx.userId,
      },
    });

    return { taskId: task.id };
  });
