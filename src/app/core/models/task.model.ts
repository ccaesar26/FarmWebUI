export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Completed = 'Completed',
}

export function statusToNumber(status: TaskStatus) {
  switch (status) {
    case TaskStatus.ToDo:
      return 0;
    case TaskStatus.InProgress:
      return 1;
    case TaskStatus.OnHold:
      return 2;
    case TaskStatus.Completed:
      return 3;
  }
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export function priorityToNumber(priority: TaskPriority) {
  switch (priority) {
    case TaskPriority.Low:
      return 0;
    case TaskPriority.Medium:
      return 1;
    case TaskPriority.High:
      return 2;
    case TaskPriority.Urgent:
      return 3;
  }
}

export enum RecurrenceType {
  None = 'None',
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Yearly = 'Yearly'
}

export function recurrenceToNumber(recurrence: RecurrenceType) {
  switch (recurrence) {
    case RecurrenceType.None:
      return 0;
    case RecurrenceType.Daily:
      return 1;
    case RecurrenceType.Weekly:
      return 2;
    case RecurrenceType.Monthly:
      return 3;
    case RecurrenceType.Yearly:
      return 4;
  }
}

export function numberToRecurrence(recurrence: number) {
  switch (recurrence) {
    case 0:
      return RecurrenceType.None;
    case 1:
      return RecurrenceType.Daily;
    case 2:
      return RecurrenceType.Weekly;
    case 3:
      return RecurrenceType.Monthly;
    case 4:
      return RecurrenceType.Yearly;
    default:
      return RecurrenceType.None;
  }
}

export interface Task {
  id: string;
  title: string;
  description: string | null | undefined;
  dueDate: string | null | undefined;
  priority: TaskPriority;
  status: TaskStatus;
  assignedUserNames: string | null | undefined;
  categoryName: string | null | undefined;
  recurrence: number;
  recurrenceEndDate: string | null;
  commentsCount?: number;
  createdAt: string;
  fieldName?: string | null | undefined;
}

export interface TaskDto {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string | null;
  priority: number;
  status: number;
  assignedUserIds: string[];
  categoryId: string | null;
  categoryName?: string | null;
  recurrence: number;
  recurrenceEndDate: string | null;
  fieldId: string;
  commentsCount: number;
  createdAt: string;
}

export interface TaskCategoryDto {
  id: string;
  name: string;
}

// DTOs for creating and updating tasks.  These *don't* include the ID.
export interface CreateTaskDto {
  title: string;
  description?: string | null;
  dueDate?: string | null;      // Use Date or string, depending on API
  priority: number;
  status: number;
  assignedUserId?: string | null;
  categoryId?: string | null;
  recurrence: number;
  recurrenceEndDate?: string | null;
  fieldId: string | null;
}

export interface UpdateTaskDto {
  title?: string; // All fields optional for updates
  description?: string | null;
  dueDate?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedUserId?: string | null;
  categoryId?: string | null;
  recurrence?: RecurrenceType;
  recurrenceEndDate?: string | null;
}

//Create Task comment

export interface CreateTaskCommentDto {
  taskId: string;
  comment: string;
}

// DTOs for filtering tasks
export interface TaskFilterDto {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedUserId?: string;
  categoryId?: string;
  dueDateStart?: string; // Use string and parse
  dueDateEnd?: string;
  title?: string
}

export interface TaskCommentDto {
  id: string;
  taskId: string;
  comment: string;
  createdAt: string;
  createdBy: string;
}
