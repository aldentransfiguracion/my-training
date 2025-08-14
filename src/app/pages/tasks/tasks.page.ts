import { Component, inject, signal } from '@angular/core';
import { TRPC_CLIENT } from '../../utils/trpc.client';
import { trpcResource } from '@fhss-web-team/frontend-utils';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TaskCardComponent } from '../../components/task-card/task-card.component';

@Component({
  selector: 'app-tasks',
  imports: [MatProgressSpinnerModule, MatPaginator, TaskCardComponent],
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
}