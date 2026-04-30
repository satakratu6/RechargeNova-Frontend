import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Notification } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  isLoading = signal(true);

  constructor(private notificationService: NotificationService, private authService: AuthService) {}

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    const user = this.authService.currentUser();
    if (!user) {
      console.warn('No user found for notifications');
      return;
    }
    
    console.log('Fetching notifications for user:', user.userId);
    this.isLoading.set(true);
    
    this.notificationService.getNotificationsByUserId(user.userId).subscribe({
      next: (data: Notification[]) => {
        console.log('Notifications received:', data.length);
        this.notifications.set(data.sort((a: Notification, b: Notification) => b.id - a.id));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Notification fetch error:', err);
        this.isLoading.set(false);
      }
    });
  }

  trackById(_: number, item: Notification) { return item.id; }
}
