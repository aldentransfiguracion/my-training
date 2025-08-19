import { Component, inject, signal } from '@angular/core';
import { TRPC_CLIENT } from '../../utils/trpc.client';
import { trpcResource } from '@fhss-web-team/frontend-utils';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-tasks',
  imports: [MatProgressSpinnerModule, MatPaginator, TaskCardComponent, MatCardModule, FormsModule, MatFormFieldModule, MatInputModule,],
  templateUrl: './tasks.page.html',
  styleUrl: './tasks.page.scss'
})
export class TasksPage {
  handlePageEvent(e: PageEvent) {
    this.pageOffset.set(e.pageIndex * e.pageSize);
  }

  trpc = inject(TRPC_CLIENT);
  PAGE_SIZE = 12;
  pageOffset = signal(0);

  taskResource = trpcResource(
    this.trpc.tasks.getTasksByUser.mutate,
    () => ({
      pageSize: this.PAGE_SIZE,
      pageOffset: this.pageOffset(),
    }),
    { autoRefresh: true }
  );

  deleteTask(taskId: string) {
    this.trpc.tasks.deleteTask.mutate({
      taskId: taskId,
    });
    this.taskResource.refresh();
  }

  createdTitle = signal('New Task');
  createdDescription = signal('New Task Description');

  isCreateTask = signal(false);
  async createTask() {
    // Validate form
    if (!this.createdTitle().trim() || !this.createdDescription().trim()) {
      return;
    }

    try {
      await this.trpc.tasks.createTask.mutate({
        title: this.createdTitle(),
        description: this.createdDescription(),
      });
      
      // Reset form and close
      this.createdTitle.set('New Task');
      this.createdDescription.set('New Task Description');
      this.isCreateTask.set(false);
      
      // Refresh task list
      this.taskResource.refresh();
    } catch (error) {
      console.error('Failed to create task:', error);
      // You could add error handling UI here
    }
  }
}