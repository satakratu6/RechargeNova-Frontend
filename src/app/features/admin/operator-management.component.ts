import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { OperatorService } from '../../core/services/operator.service';
import { Operator, Plan } from '../../core/models/operator.model';

@Component({
  selector: 'app-operator-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './operator-management.component.html'
})
export class OperatorManagementComponent implements OnInit {
  operators = signal<Operator[]>([]);
  selectedOp = signal<Operator | null>(null);
  modalError = signal<string>('');
  
  // Modal states
  showModal = false;
  modalMode: 'ADD_OP' | 'EDIT_OP' | 'ADD_PLAN' | 'EDIT_PLAN' = 'ADD_OP';
  operatorForm!: FormGroup;
  planForm!: FormGroup;

  isFieldInvalid(formName: 'operator' | 'plan', field: string): boolean {
    const form = formName === 'operator' ? this.operatorForm : this.planForm;
    const control = form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  constructor(private fb: FormBuilder, private operatorService: OperatorService) {
    this.createForms();
  }

  ngOnInit(): void { this.loadOperators(); }

  loadOperators(): void {
    this.operatorService.getOperators().subscribe(data => {
      this.operators.set(data);
      if (this.selectedOp()) {
        const found = data.find(o => o.id === this.selectedOp()?.id);
        if (found) this.selectedOp.set(found);
      }
    });
  }

  createForms(): void {
    this.operatorForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      circle: ['', Validators.required]
    });

    this.planForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1)]],
      validity: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  selectOperator(op: Operator): void { this.selectedOp.set(op); }

  // Operator CRUD
  openAddOperator(): void {
    this.modalMode = 'ADD_OP';
    this.operatorForm.reset();
    this.modalError.set('');
    this.showModal = true;
  }

  openEditOperator(op: Operator): void {
    this.modalMode = 'EDIT_OP';
    this.operatorForm.patchValue({ 
      name: op.name,
      type: op.type,
      circle: op.circle
    });
    this.modalError.set('');
    this.showModal = true;
  }

  deleteOperator(id: number): void {
    if (confirm('Are you sure? All associated plans will be deleted.')) {
      this.operatorService.deleteOperator(id).subscribe(() => {
        this.loadOperators();
        if (this.selectedOp()?.id === id) this.selectedOp.set(null);
      });
    }
  }

  // Plan CRUD
  openAddPlan(): void {
    this.modalMode = 'ADD_PLAN';
    this.planForm.reset();
    this.modalError.set('');
    this.showModal = true;
  }

  openEditPlan(plan: Plan): void {
    this.modalMode = 'EDIT_PLAN';
    this.planForm.patchValue({ 
      amount: plan.amount, 
      validity: plan.validity, 
      description: plan.description 
    });
    if (this.planForm.contains('planId')) {
      this.planForm.setControl('planId', this.fb.control(plan.id));
    } else {
      this.planForm.addControl('planId', this.fb.control(plan.id));
    }
    this.modalError.set('');
    this.showModal = true;
  }

  deletePlan(id: number): void {
    if (confirm('Delete this plan?')) {
      this.operatorService.deletePlan(id).subscribe(() => this.loadOperators());
    }
  }

  submitForm(): void {
    const opId = this.selectedOp()?.id;
    this.modalError.set('');

    if (this.modalMode === 'ADD_OP' || this.modalMode === 'EDIT_OP') {
      if (this.operatorForm.invalid) return;
      const opData = this.operatorForm.value;
      if (this.modalMode === 'ADD_OP') {
        this.operatorService.createOperator(opData).subscribe({
          next: () => this.finalizeSubmit(),
          error: (err) => this.handleFormError(err)
        });
      } else {
        this.operatorService.updateOperator(opId!, opData).subscribe({
          next: () => this.finalizeSubmit(),
          error: (err) => this.handleFormError(err)
        });
      }
    } else {
      if (this.planForm.invalid) return;
      const planData = this.planForm.value;
      if (this.modalMode === 'ADD_PLAN') {
        this.operatorService.createPlan(opId!, planData).subscribe({
          next: () => this.finalizeSubmit(),
          error: (err) => this.handleFormError(err)
        });
      } else {
        this.operatorService.updatePlan(planData.planId, planData).subscribe({
          next: () => this.finalizeSubmit(),
          error: (err) => this.handleFormError(err)
        });
      }
    }
  }

  handleFormError(err: any): void {
    console.error('Form submission error:', err);
    let msg = 'An unexpected validation error occurred. Please verify inputs.';
    
    if (err.error && err.error.error) {
      msg = err.error.error;
    } else if (err.error && typeof err.error === 'string') {
      msg = err.error;
    }

    // Clean Spring Validation constraints safely taking nested quotes into account
    if (msg.includes("interpolatedMessage='") && msg.includes(", propertyPath=")) {
      const firstPart = msg.split(", propertyPath=")[0];
      const msgPart = firstPart.split("interpolatedMessage='")[1];
      if (msgPart) {
        msg = msgPart.substring(0, msgPart.length - 1);
      }
    } else if (msg.includes("messageTemplate='")) {
      const clean = msg.split("messageTemplate='")[1]?.split("'")[0];
      if (clean) msg = clean;
    }

    if (msg.includes("Validity must be like")) {
      msg = "Validity must be end with days or months";
    }

    this.modalError.set(msg);
  }

  finalizeSubmit(): void {
    this.showModal = false;
    this.loadOperators();
    this.operatorForm.reset();
    this.planForm.reset();
  }
}
