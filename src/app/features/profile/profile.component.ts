import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ThemeSwitcherComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user = signal<UserResponse | null>(null);
  isLoading = signal(true);
  isUploading = signal(false);

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    const auth = this.authService.currentUser();
    if (auth) {
      this.isLoading.set(true);
      this.userService.getUserById(auth.userId).subscribe({
        next: (u: UserResponse) => { 
          this.user.set(u); 
          this.isLoading.set(false); 
        },
        error: (err) => { 
          console.error('Critical Error: Profile Sync Failed', err);
          this.isLoading.set(false); 
        }
      });
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('profilePicInput') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    const auth = this.authService.currentUser();
    
    if (file && auth) {
      this.isUploading.set(true);
      this.userService.uploadProfileImage(auth.userId, file).subscribe({
        next: (updatedUser: UserResponse) => {
          this.user.set(updatedUser);
          this.authService.updateUser({ profileImageUrl: updatedUser.profileImageUrl });
          this.isUploading.set(false);
        },
        error: (err) => {
          console.error('Image upload failed:', err);
          this.isUploading.set(false);
        }
      });
    }
  }
}
