import { expect, Page, test } from '@playwright/test';
import { prisma } from '../../prisma/client';
import generateDummyUserData from '../User Helper Functions/generateDummyUserData';
import { TaskCreateManyInput } from '../../prisma/generated/models';

async function signInTestUser(page: Page): Promise<string> {
  // create a user in prisma
  const dummyUser = generateDummyUserData({permissions:['manage-tasks', 'manage-users-full-access']});
  const createdUser = await prisma.user.create({ data: dummyUser });
  // go to the sign in page
  await page.goto(`http://localhost:4200/proxy?net_id=${createdUser.netId}`);
  // return the id of our user
  return createdUser.id;
}

test.describe('Task page', () => {
  let dummyUserId: string;

  // beforeEach will go here
  test.beforeEach(async ({ page }) => {
    dummyUserId = await signInTestUser(page);
    await page.goto('http://localhost:4200/tasks');
  })
  // afterEach will go here
  test.afterEach(async ({ page }) => {
    await prisma.user.delete({where: {id:dummyUserId}});
  });

  // Tests will go here
  test('pagination buttons', async ({ page }) => {
    const NUMBER_OF_TASKS = 100;
    const createArray: TaskCreateManyInput[] = [];
    for (let i = 0; i < NUMBER_OF_TASKS; i++) {
      createArray.push({
        title: `pagination test: ${i}`,
        description: i.toString(),
        status: 'Complete',
        ownerId: dummyUserId,
      });
    }
    const tasks = await prisma.task.createManyAndReturn({ data: createArray });
  
    // testing goes here
    const cards = page.locator('task-card');
    await page.goto('http://localhost:4200/tasks');
    await expect(page.getByRole('group')).toContainText('1 – 12 of 100');
    await expect(cards).toHaveCount(12);
    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(page.getByRole('group')).toContainText('13 – 24 of 100');
    await expect(cards).toHaveCount(12);
    await page.getByRole('button', { name: 'Last page' }).click();
    await expect(page.getByRole('group')).toContainText('97 – 100 of 100');
    await expect(cards).toHaveCount(4);

  
    const deleteConditions = tasks.map(task => ({ id: task.id }));
    await prisma.task.deleteMany({ where: { OR: deleteConditions } });
  });

  test('Create Task', async ({ page }) => {
    await page.goto('http://localhost:4200/tasks');
    
    const initialTaskCount = await page.locator('task-card').count();
    await page.getByRole('button', { name: 'Create Task' }).click();
    await expect(page.locator('mat-card')).toBeVisible();
    await expect(page.locator('mat-form-field')).toHaveCount(2);
    
    const testTitle = 'Test Task Title';
    const testDescription = 'Test Task Description';

    await page.getByLabel('Title').fill(testTitle);
    await page.getByLabel('Description').fill(testDescription);
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    
    await expect(page.locator('task-card')).toHaveCount(initialTaskCount + 1);
    
    const newTaskCard = page.locator('task-card').last();
    await expect(newTaskCard.locator('mat-card-title')).toContainText(testTitle);
    await expect(newTaskCard.locator('mat-card-content p').first()).toContainText(testDescription);
    
    await page.reload();
    await expect(page.locator('task-card')).toHaveCount(initialTaskCount + 1);
    
    const deleteButton = page.locator('task-card').last().getByRole('button', { name: 'delete' });
    await deleteButton.click();
    
    await expect(page.locator('task-card')).toHaveCount(initialTaskCount);
  });

  test('Delete Task', async ({ page }) => {
    const NUMBER_OF_TASKS = 10;
    const createArray: TaskCreateManyInput[] = [];
    for (let i = 0; i < NUMBER_OF_TASKS; i++) {
      createArray.push({
        title: `pagination test: ${i}`,
        description: i.toString(),
        status: 'Complete',
        ownerId: dummyUserId,
      });
    }
    await page.locator('body').click();
    const tasks = await prisma.task.createManyAndReturn({ data: createArray });
    await page.goto('http://localhost:4200/tasks');
    const initialTaskCount = await page.locator('task-card').count();
    const deleteButton = page.locator('task-card').last().getByRole('button', { name: 'delete' });
    await deleteButton.click();
    await expect(page.locator('task-card')).toHaveCount(initialTaskCount - 1);

    await prisma.task.deleteMany({ where: { OR: tasks.map(task => ({ id: task.id })) } });
  });
});