import { makeDummy } from "@fhss-web-team/backend-utils";
import { prisma } from "../../../../prisma/client";

export const deleteTasks = makeDummy({
  name: "Delete tasks",
  description: "Deletes all tasks.",
  handler: async () => {
    const count = await prisma.task.count();
    await prisma.task.deleteMany({});
    return `Deleted ${count} tasks`;

  },
});