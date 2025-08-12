import { z } from 'zod/v4';
import { prisma, TaskStatus } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';
import { isPrismaError } from '../../../utils/prisma';
import { TRPCError } from '@trpc/server';

const updateTaskInput = z.object({
  taskId: z.string(),
  newTitle: z.optional(z.string()),
  newDescription: z.optional(z.string()),
  newStatus: z.optional(z.literal(Object.values(TaskStatus))),
});

const updateTaskOutput = z.object({
  status: z.literal(Object.values(TaskStatus)),
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string(),
  description: z.string(),
  completedAt: z.nullable(z.date()),
  ownerId: z.string(),
});

export const updateTask = authorizedProcedure
  .meta({ requiredPermissions: ['manage-tasks'] })
  .input(updateTaskInput)
  .output(updateTaskOutput)
  .mutation(async (opts) => { 
    const oldTask = await prisma.task.findUnique({
      where: { id: opts.input.taskId, ownerId: opts.ctx.userId },
    });
    if (!oldTask) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }

    //calculate completedAt date based on status changes
    let calculatedCompletedAt: Date | null = oldTask.completedAt;
    if (opts.input.newStatus) {
      if (opts.input.newStatus != oldTask.status) {
        //if we just switched the task to complete
        if (opts.input.newStatus === 'Complete') {
          calculatedCompletedAt = new Date();
        }
        //if we just switched the task off complete
        else if (oldTask.status === 'Complete') {
          calculatedCompletedAt = null;
        }
      }
    }

    try {
      return await prisma.task.update({
        where: {
          id: oldTask.id,
          ownerId: opts.ctx.userId,
        },
        data: {
          title: opts.input.newTitle?.trim(),
          description: opts.input.newDescription,
          status: opts.input.newStatus,
          completedAt: calculatedCompletedAt,
        },
      });
    } catch (error) {
      if (isPrismaError(error, 'NOT_FOUND')) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `failed to update task: ${oldTask.id} under user: ${opts.ctx.user.netId}`,
        });
      }
      throw error;
    }
  });
