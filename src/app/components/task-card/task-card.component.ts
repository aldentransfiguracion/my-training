import { Component, inject, input, linkedSignal, output, signal, ViewChild } from '@angular/core';
import type { Task } from '../../../../prisma/client';
import { TRPC_CLIENT } from '../../utils/trpc.client';
import { trpcResource } from '@fhss-web-team/frontend-utils';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'task-card',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, FormsModule, MatIcon, MatMenuModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
  editMode = signal(false)
  initialTaskValue = input.required<Task>();

  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;
  OpenMenu() {
    this.trigger.openMenu();
  } 

  
  newTitle = linkedSignal(() => this.initialTaskValue().title);
  newDescription = linkedSignal(() => this.initialTaskValue().description);
  newStatus = linkedSignal(() => this.initialTaskValue().status);
  
  trpc = inject(TRPC_CLIENT);
  taskCardState = trpcResource(
    this.trpc.tasks.updateTask.mutate,
    () => ({
      taskId: this.initialTaskValue().id,
      newTitle: this.newTitle(),
      newDescription: this.newDescription(),
      newStatus: this.newStatus(),
    }),
    { valueComputation: () => this.initialTaskValue() }
  );

  saveChanges() {
    this.taskCardState.value.update((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        title: this.newTitle(),
        description: this.newDescription(),
        status: this.newStatus(),
      }
    })
    this.taskCardState.refresh();
    this.editMode.set(false);
  }
  
  cancelChanges() {
    this.newTitle.set(this.initialTaskValue().title);
    this.newDescription.set(this.initialTaskValue().description);
    this.newStatus.set(this.initialTaskValue().status);
    this.editMode.set(false);
  }

  deleteTaskEvent = output<string>();
  deleteTask() {
    this.deleteTaskEvent.emit(this.initialTaskValue().id);
  }
}
