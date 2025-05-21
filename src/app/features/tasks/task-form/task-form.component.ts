import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Signal
} from '@angular/core';
import { Fluid } from 'primeng/fluid';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Card } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Message } from 'primeng/message';

import { Textarea } from 'primeng/textarea';
import { Calendar } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import {
  recurrenceToNumber,
  RecurrenceType,
  TaskCategoryDto, Task,
  TaskPriority,
  TaskStatus, numberToRecurrence
} from '../../../core/models/task.model';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { UserProfileDto } from '../../../core/models/user-profile.model';
import { Field } from '../../../core/models/field.model';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-task-form',
  imports: [
    Fluid,
    ReactiveFormsModule,
    Card,
    FloatLabel,
    InputText,
    Tooltip,
    Message,
    Textarea,
    Calendar,
    DropdownModule,
    Select,
    MultiSelect,
    ButtonDirective
],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent implements OnInit {

  @Input() task: Task | null = null;
  @Output() save = new EventEmitter<Task>();
  @Output() cancel = new EventEmitter<void>();

  @Input({ required: true }) categories!: TaskCategoryDto[];
  @Input({ required: true }) workers!: UserProfileDto[];
  @Input({ required: true }) fields!: Field[];

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

  categoryNames: Signal<string[]> = computed(() => this.categories.map(c => c.name));
  workerNames: Signal<string[]> = computed(() => this.workers.map(w => w.name));
  locationNames: Signal<string[]> = computed(() => this.fields.map(f => f.name));

  // constructor(
  //   private userService: UserService,
  //   private userProfileService: UserProfileService,
  //   private farmerTasksService: FarmerTasksService,
  //   private fieldService: FieldService,
  //   private location: Location
  // ) {
  // }

  ngOnInit(): void {
    if (this.task) {
      this.form.patchValue({
        title: this.task.title,
        description: this.task.description,
        dueDate: this.task.dueDate,
        priority: this.task.priority,
        category: this.task.categoryName,
        recurrenceType: numberToRecurrence(this.task.recurrence),
        recurrenceEndDate: this.task.recurrenceEndDate,
        assignees: this.task.assignedUserNames?.split(',') ?? [],
        location: this.task.fieldName
      });
    }
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

    const task: Task = {
      id: this.task?.id ?? '',
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
      categoryName: category ?? '',
      recurrence: recurrenceType ? recurrenceToNumber(recurrenceType) : 0,
      recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : null,
      fieldName: location ?? '',
      assignedUserNames: assignees?.join(',') ?? '',
      status: TaskStatus.ToDo,
      createdAt: new Date().toISOString()
    }

    this.save.emit(task);
  }

  isRecurring() {
    return this.form.controls.recurrenceType.value !== RecurrenceType.None;
  }

  onCancel() {
    this.cancel.emit();
  }

  isAddMode(): boolean {
    return !this.task;
  }
}
