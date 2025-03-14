export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Completed = 'Completed',
  Blocked = 'Blocked',
  Cancelled = 'Cancelled',
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
    case TaskStatus.Blocked:
      return 4;
    case TaskStatus.Cancelled:
      return 5;
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
      return 2;
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

export interface TaskDto {
  id: string; // Use string for GUIDs from .NET
  title: string;
  description?: string | null; // Optional
  dueDate: string | null;       // String, to be parsed as Date
  priority: TaskPriority;
  status: TaskStatus;
  assignedUserId: string; // Use string for GUIDs
  categoryId: string | null;    // Use string for GUIDs
  categoryName?: string | null;  // Optional
  recurrence: RecurrenceType;
  recurrenceEndDate: string | null;  // String, to be parsed as date
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
  status: TaskStatus;
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
