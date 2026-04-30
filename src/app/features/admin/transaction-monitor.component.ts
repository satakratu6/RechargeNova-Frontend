import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';
import { PaymentService, PaymentResponse } from '../../core/services/payment.service';
import { RechargeService } from '../../core/services/recharge.service';
import { UserService } from '../../core/services/user.service';
import { OperatorService } from '../../core/services/operator.service';
import { RechargeResponse } from '../../core/models/recharge.model';
import { Operator, Plan } from '../../core/models/operator.model';
import { UserResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-transaction-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, ThemeSwitcherComponent],
  templateUrl: './transaction-monitor.component.html',
})
export class TransactionMonitorComponent implements OnInit {
  allTransactions = signal<PaymentResponse[]>([]);
  selectedTx = signal<PaymentResponse | null>(null);
  
  // Data State Signals
  rechargeDetail = signal<RechargeResponse | null>(null);
  userSignal = signal<UserResponse | null>(null);
  operatorSignal = signal<Operator | null>(null);
  planSignal = signal<Plan | null>(null);
  
  // UI State Signals
  loadingDetail = signal(false);
  userFetchError = signal(false);
  
  searchTerm = '';
  limit = 0;

  filteredTransactions = computed(() => {
    let result = this.allTransactions();
    result = [...result].sort((a, b) => b.id - a.id);

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(t => 
        t.id.toString().includes(term) ||
        t.userId.toString().includes(term) ||
        t.amount.toString().includes(term)
      );
    }

    if (this.limit > 0) {
      result = result.slice(0, this.limit);
    }

    return result;
  });

  constructor(
    private paymentService: PaymentService,
    private rechargeService: RechargeService,
    private userService: UserService,
    private operatorService: OperatorService
  ) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.paymentService.getAllPayments().subscribe({
      next: (data) => this.allTransactions.set(data),
      error: (err) => console.error('Error fetching transactions:', err)
    });
  }

  applyFilters(): void {
    // Handled by Signals
  }

  viewDetails(tx: PaymentResponse): void {
    console.log('--- Inspecting Transaction ---');
    console.log('Transaction Data:', tx);
    
    this.selectedTx.set(tx);
    this.loadingDetail.set(true);
    this.userFetchError.set(false);
    
    // Clear previous view state
    this.userSignal.set(null);
    this.rechargeDetail.set(null);
    this.operatorSignal.set(null);
    this.planSignal.set(null);
    
    // 1. Fetch User Data
    this.userService.getUserById(tx.userId).subscribe({
      next: (user) => {
        console.log('User Profile Fetched:', user);
        this.userSignal.set(user);
      },
      error: (err) => {
        console.warn('Could not fetch user profile for ID:', tx.userId, err);
        this.userFetchError.set(true);
      }
    });

    // 2. Fetch Recharge Link
    this.rechargeService.getRechargeById(tx.rechargeId).subscribe({
      next: (recharge) => {
        console.log('Linked Recharge Found:', recharge);
        this.rechargeDetail.set(recharge);
        
        // 3. Parallel fetch of names from Operator Service
        this.operatorService.getOperatorById(recharge.operatorId).subscribe(op => {
          this.operatorSignal.set(op);
        });
        
        this.operatorService.getPlanById(recharge.planId).subscribe(p => {
          this.planSignal.set(p);
        });

        this.loadingDetail.set(false);
      },
      error: (err) => {
        console.error('Failed to resolve linked recharge context:', err);
        this.loadingDetail.set(false);
      }
    });
  }

  closeDetails(): void {
    this.selectedTx.set(null);
    this.userSignal.set(null);
    this.rechargeDetail.set(null);
  }
}
