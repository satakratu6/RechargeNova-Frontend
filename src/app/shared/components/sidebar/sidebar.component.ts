import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  userName = signal<string>('');

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user && user.userId > 0) {
      this.userService.getUserById(user.userId).subscribe({
        next: (u) => this.userName.set(u.name),
        error: (err) => console.error('Failed to fetch user name for sidebar', err)
      });
    } else if (user && user.role === 'ADMIN') {
      this.userName.set('Admin');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
