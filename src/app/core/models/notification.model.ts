export type NotificationType = "NewReport" | "NewReportComment" | "CommentAdded" | "NewTask";

export interface NotificationDto {
  id: string;
  notificationType: NotificationType;
  sourceEntityId: string;
  triggeringUserId: string;
  timestamp: string;
  targetFarmId: string;
  targetUserId: string | null;
  isRead: boolean;
}

export interface NotificationEntry {
  id: string;
  notificationType: NotificationType;
  entityId: string;
  userName: string;
  timestamp: Date;
  isRead: boolean;
  title: string;
  message: string;
}

export function ToNotificationEntry(dto: NotificationDto, userName: string): NotificationEntry {
  let title = '';
  let message = '';
  switch (dto.notificationType) {
    case "NewReport":
      title = "New Report";
      message = `User ${userName} reported a new issue`;
      break;
    case "NewReportComment":
      title = "New Comment on Report";
      message = "User " + userName + " commented on a report";
      break;
    case "CommentAdded":
      title = "Comment Added";
      message = "User " + userName + " added a comment";
      break;
    case "NewTask":
      title = "New Task Assigned";
      message = "The new task was successfully assigned";
      break;
    default:
      message = "Unknown notification type";
      break;
  }

  return {
    id: dto.id,
    notificationType: dto.notificationType,
    entityId: dto.sourceEntityId,
    userName: userName,
    timestamp: new Date(dto.timestamp),
    isRead: dto.isRead,
    title: title,
    message: message
  };
}
