import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';
import { AuthService } from '../../core/services/auth.service';
import { RechargeService } from '../../core/services/recharge.service';
import { RechargeResponse } from '../../core/models/recharge.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, ThemeSwitcherComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  recentHistory = signal<RechargeResponse[]>([]);

  totalRecharges = signal(0);
  totalSpend = signal(0);
  successCount = signal(0);
  pendingCount = signal(0);

  constructor(
    private authService: AuthService,
    private rechargeService: RechargeService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user && user.userId > 0) {
      this.rechargeService.getRechargesByUserId(user.userId).subscribe((data: RechargeResponse[]) => {
        this.recentHistory.set(data.slice(0, 5));
        this.totalRecharges.set(data.length);
        this.totalSpend.set(data.reduce((sum, r) => sum + r.amount, 0));
        this.successCount.set(data.filter(r => r.status === 'SUCCESS').length);
        this.pendingCount.set(data.filter(r => r.status === 'PENDING').length);
      });
    }
  }

  trackById(_: number, item: RechargeResponse) { return item.id; }
}
