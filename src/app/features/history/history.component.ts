import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { RechargeService } from '../../core/services/recharge.service';
import { AuthService } from '../../core/services/auth.service';
import { RechargeResponse } from '../../core/models/recharge.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './history.component.html',
})
export class HistoryComponent implements OnInit {
  history = signal<RechargeResponse[]>([]);
  isLoading = false;
  searchTerm = '';
  activeFilter = 'All';
  readonly filters = ['All', 'SUCCESS', 'FAILED', 'PENDING'];

  successCount = () => this.history().filter(h => h.status === 'SUCCESS').length;
  totalSpent = () => this.history().reduce((s, h) => s + h.amount, 0);

  constructor(private rechargeService: RechargeService, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.isLoading = true;
      this.rechargeService.getRechargesByUserId(user.userId).subscribe((data: RechargeResponse[]) => {
        this.history.set(data);
        this.isLoading = false;
      });
    }
  }

  filteredHistory(): RechargeResponse[] {
    let data = this.history();
    if (this.activeFilter !== 'All') data = data.filter(h => h.status === this.activeFilter);
    if (this.searchTerm) data = data.filter(h => h.mobileNumber.includes(this.searchTerm));
    return data;
  }

  trackById(_: number, item: RechargeResponse) { return item.id; }
}
