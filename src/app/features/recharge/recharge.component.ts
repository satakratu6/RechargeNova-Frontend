import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { OperatorService } from '../../core/services/operator.service';
import { RechargeService } from '../../core/services/recharge.service';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { Operator, Plan } from '../../core/models/operator.model';

import { RechargeRequest, RechargeResponse } from '../../core/models/recharge.model';

@Component({
  selector: 'app-recharge',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, RouterModule],
  templateUrl: './recharge.component.html',
})
export class RechargeComponent implements OnInit {
  currentStep = signal(0);
  operators = signal<Operator[]>([]);
  isLoadingOps = signal(true);

  mobileNumber = '';
  selectedOperator = signal<Operator | null>(null);
  selectedPlan = signal<Plan | null>(null);
  selectedMethod = 'RAZORPAY';
  planSearch = signal('');
  isLoading = signal(false);
  rechargeResult = signal<RechargeResponse | null>(null);

  readonly steps = ['Details', 'Plans', 'Payment'];
  readonly methods = [
    { id: 'RAZORPAY', label: 'Razorpay Secure', sub: 'UPI, Cards, NetBanking, Wallets', icon: '💳' }
  ];

  constructor(
    private operatorService: OperatorService,
    private rechargeService: RechargeService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router
  ) {}


  ngOnInit(): void {
    console.log('Fetching operators...');
    this.isLoadingOps.set(true);
    this.operatorService.getOperators().subscribe({
      next: (ops: Operator[]) => {
        console.log('Operators received:', ops);
        this.operators.set(ops || []);
        this.isLoadingOps.set(false);
        
        // Force refresh if needed
        if (ops && ops.length > 0) {
          console.log('Successfully loaded ' + ops.length + ' operators');
        }
      },
      error: (err) => {
        console.error('Error fetching operators:', err);
        this.isLoadingOps.set(false);
        this.operators.set([]); // Ensure empty state on error
      }
    });
  }

  isStep1Valid = () => this.mobileNumber.length === 10 && !!this.selectedOperator();
  selectOperator = (op: Operator) => this.selectedOperator.set(op);
  selectPlan = (plan: Plan) => this.selectedPlan.set(plan);
  nextStep = () => this.currentStep.update(s => s + 1);
  prevStep = () => this.currentStep.update(s => s - 1);

  filteredPlans = computed(() => {
    const plans = this.selectedOperator()?.plans || [];
    const search = this.planSearch();
    if (!search) return plans;

    const searchNum = parseFloat(search.trim());
    const isNumeric = !isNaN(searchNum);

    return plans.filter((p: Plan) => {
      const matchesDesc = p.description.toLowerCase().includes(search.toLowerCase());
      
      if (isNumeric) {
        // Specific plan amount, and 100 less than and 100 greater than that amount
        const matchesAmountRange = p.amount >= (searchNum - 100) && p.amount <= (searchNum + 100);
        return matchesAmountRange || matchesDesc;
      }
      
      return matchesDesc;
    });
  });

  processRecharge(): void {
    if (!this.selectedOperator() || !this.selectedPlan()) return;
    this.isLoading.set(true);

    const user = this.authService.currentUser();
    if (!user) {
      console.error('User not authenticated');
      this.isLoading.set(false);
      return;
    }

    const amount = this.selectedPlan()!.amount;

    this.paymentService.createOrder(amount).subscribe({
      next: (orderRes) => {
        this.openRazorpayCheckout(orderRes, user);
      },
      error: (err) => {
        console.error('Order creation failed', err);
        this.isLoading.set(false);
      }
    });
  }

  openRazorpayCheckout(orderRes: any, user: any): void {
    const options: any = {
      key: orderRes.keyId,
      amount: orderRes.amount,
      currency: orderRes.currency,
      name: 'RechargeNova',
      description: this.selectedPlan()?.description || 'Mobile Recharge',
      order_id: orderRes.orderId,
      prefill: {
        name: user.name,
        email: user.email,
        contact: this.mobileNumber
      },
      handler: (response: any) => {
        this.verifyAndCompleteRecharge(response, orderRes);
      },
      theme: {
        color: '#7c3aed'
      },
      modal: {
        ondismiss: () => {
          this.isLoading.set(false);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  verifyAndCompleteRecharge(rzpResponse: any, orderRes: any): void {
    const req: RechargeRequest = {
      mobileNumber: this.mobileNumber,
      operatorId: this.selectedOperator()!.id,
      planId: this.selectedPlan()!.id,
      paymentMethod: this.selectedMethod,
    };

    const verifyPayload = {
      orderId: rzpResponse.razorpay_order_id,
      paymentId: rzpResponse.razorpay_payment_id,
      signature: rzpResponse.razorpay_signature,
      paymentRequest: {
        rechargeId: null,
        userId: this.authService.currentUser()?.userId,
        amount: this.selectedPlan()!.amount,
        paymentMethod: this.selectedMethod,
        validity: this.selectedPlan()!.validity,
        description: this.selectedPlan()!.description
      }
    };

    this.paymentService.verifyPayment(verifyPayload).subscribe({
      next: (payRes) => {
        this.rechargeService.initiateRecharge(req).subscribe({
          next: (res: RechargeResponse) => { 
            this.rechargeResult.set(res); 
            this.isLoading.set(false); 
            this.nextStep(); 
          },
          error: () => { 
            this.isLoading.set(false); 
          }
        });
      },
      error: (err) => {
        console.error('Verification failed', err);
        this.isLoading.set(false);
      }
    });
  }


  reset(): void {
    this.currentStep.set(0);
    this.mobileNumber = '';
    this.selectedOperator.set(null);
    this.selectedPlan.set(null);
    this.rechargeResult.set(null);
    this.planSearch.set('');
  }
}
