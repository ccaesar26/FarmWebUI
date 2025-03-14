export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Completed = 'Completed',
  Blocked = 'Blocked',
  Cancelled = 'Cancelled',
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export enum RecurrenceType {
  None = 'None',
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Yearly = 'Yearly'
  // Add other recurrence types as needed
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

// DTOs for creating and updating tasks.  These *don't* include the ID.
export interface CreateTaskDto {
  title: string;
  description?: string | null;
  dueDate?: string | null;      // Use Date or string, depending on API
  priority: TaskPriority;
  status: TaskStatus;
  assignedUserId?: string | null;
  categoryId?: string | null;
  recurrence: RecurrenceType;
  recurrenceEndDate?: string | null;
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
