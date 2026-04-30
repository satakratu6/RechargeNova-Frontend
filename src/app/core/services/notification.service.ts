import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly BASE_URL = '/api/notifications';

  constructor(private http: HttpClient) {}

  getNotificationsByUserId(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.BASE_URL}/user/${userId}`);
  }

  getNotificationById(id: number): Observable<Notification> {
    return this.http.get<Notification>(`${this.BASE_URL}/${id}`);
  }
}
