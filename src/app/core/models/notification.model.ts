export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: 'SMS' | 'EMAIL';
  status: 'SENT' | 'FAILED';
  createdAt: string;
}
