import { Component, computed, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { Fluid } from 'primeng/fluid';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Card } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Message } from 'primeng/message';
import { Location, NgIf } from '@angular/common';
import { Textarea } from 'primeng/textarea';
import { Calendar } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import {
  CreateTaskDto, priorityToNumber, recurrenceToNumber,
  RecurrenceType, statusToNumber,
  TaskCategoryDto,
  TaskPriority,
  TaskStatus
} from '../../../core/models/task.model';
import { FarmerTasksService } from '../../../core/services/farmer-tasks.service';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { UserService } from '../../../core/services/user.service';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { UserProfileDto } from '../../../core/models/user-profile.model';
import { Field } from '../../../core/models/field.model';
import { FieldService } from '../../../core/services/field.service';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-create-task',
  imports: [
    Fluid,
    ReactiveFormsModule,
    Card,
    FloatLabel,
    InputText,
    Tooltip,
    Message,
    NgIf,
    Textarea,
    Calendar,
    DropdownModule,
    Select,
    MultiSelect,
    ButtonDirective
  ],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.css'
})
export class CreateTaskComponent implements OnInit {
  form = new FormGroup({
    title: new FormControl<string>('', [ Validators.required ]),
    description: new FormControl<string>('', [ Validators.maxLength(5000) ]),
    dueDate: new FormControl<string | null>(null),
    priority: new FormControl<TaskPriority | null>(null, [ Validators.required ]),
    category: new FormControl<string | null>(null),
    recurrenceType: new FormControl<RecurrenceType>(RecurrenceType.None, [ Validators.required ]),
    recurrenceEndDate: new FormControl<string | null>(null),
    assignees: new FormControl<string[]>([]),
    location: new FormControl<string | null>(null, [ Validators.required ])
  });

  submitted: boolean = false;
  priorities: string[] = Object.values(TaskPriority);
  recurrenceTypes: string[] = Object.values(RecurrenceType);
  submitting: boolean = false;

  categories: WritableSignal<TaskCategoryDto[]> = signal([]);
  workers: WritableSignal<UserProfileDto[]> = signal([]);
  fields: WritableSignal<Field[]> = signal([]);

  categoryNames: Signal<string[]> = computed(() => this.categories().map(c => c.name));
  workerNames: Signal<string[]> = computed(() => this.workers().map(w => w.name));
  locationNames: Signal<string[]> = computed(() => this.fields().map(f => f.name));

  constructor(
    private userService: UserService,
    private userProfileService: UserProfileService,
    private farmerTasksService: FarmerTasksService,
    private fieldService: FieldService,
    private location: Location
  ) {
  }

  ngOnInit(): void {
    this.farmerTasksService.getTaskCategories().subscribe(categories => {
      this.categories.set(categories);
    });

    this.userService.getWorkerUsers()
      .subscribe(users => {
          users.map(user =>
            this.userProfileService.getProfileByUserId(user.id)
              .subscribe(userProfile => this.workers.set([ ...this.workers(), userProfile ]))
          );
        }
      );

    this.fieldService.getFields()
      .subscribe(fields => this.fields.set(fields));
  }

  onSubmit() {
    this.submitting = true;
    this.submitted = true;

    if (!this.form.valid) {
      this.submitting = false;
      this.submitted = false;
      return;
    }

    const {
      title,
      description,
      dueDate,
      priority,
      category,
      recurrenceType,
      recurrenceEndDate,
      assignees,
      location
    } = this.form.value;

    if (title == null || priority == null || location == null) {
      this.submitting = false;
      this.submitted = false;
      return;
    }

    const createTaskDto: CreateTaskDto = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      priority: priorityToNumber(priority),
      categoryId: this.categories().find(c => c.name === category)?.id ?? '',
      recurrence: recurrenceToNumber(recurrenceType ? recurrenceType : RecurrenceType.None),
      recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : null,
      fieldId: this.fields().find(f => f.name === location)?.id ?? '',
      status: statusToNumber(TaskStatus.ToDo)
    }

    const assignUsersToTaskDto = this.workers().filter(w => assignees?.includes(w.name)).map(w => w.id);


    this.farmerTasksService.createTask(createTaskDto)
      .subscribe({
        next: (taskId) => {
          this.farmerTasksService.assignTask(taskId, assignUsersToTaskDto)
            .subscribe({
              next: () => {
                this.location.back();
              },
              error: () => {
                this.submitting = false;
                this.submitted = false;
                alert('Failed to assign users to task');
              }
            });
        },
        error: () => {
          this.submitting = false;
          this.submitted = false;
          alert('Failed to create task');
        }
      });
  }

  isRecurring() {
    return this.form.controls.recurrenceType.value !== RecurrenceType.None;
  }

  onCancel() {
    this.location.back();
  }
}
