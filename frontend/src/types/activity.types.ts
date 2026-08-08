export interface ActivityUser {
  id: string;
  name: string;
  email: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  userId: string;
  user?: ActivityUser;
  createdAt: string;
}
