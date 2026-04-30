import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';
import { OperatorService } from '../../core/services/operator.service';
import { RechargeService } from '../../core/services/recharge.service';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, ThemeSwitcherComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  stats = signal({ operators: 0, revenue: 0, successRate: 0 });

  constructor(
    private operatorService: OperatorService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.operatorService.getOperators().subscribe(ops => {
      this.stats.update(s => ({ ...s, operators: ops.length }));
    });

    this.paymentService.getAllPayments().subscribe(transactions => {
      const revenue = transactions.filter(t => t.status === 'SUCCESS').reduce((acc, curr) => acc + curr.amount, 0);
      const successCount = transactions.filter(t => t.status === 'SUCCESS').length;
      const rate = transactions.length > 0 ? Math.round((successCount / transactions.length) * 100) : 0;
      
      this.stats.update(s => ({ ...s, revenue, successRate: rate }));
    });
  }
}
