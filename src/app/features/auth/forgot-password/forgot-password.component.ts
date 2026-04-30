import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  step = 1;
  isLoading = false;
  message = '';
  isError = false;

  emailForm: FormGroup;
  otpForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  onEmailSubmit() {
    if (this.emailForm.valid) {
      this.isLoading = true;
      this.message = '';
      console.log('Sending OTP request for:', this.emailForm.value.email);
      
      this.authService.forgotPassword(this.emailForm.value.email).subscribe({
        next: (response) => {
          console.log('OTP Response received:', response);
          this.step = 2;
          this.isLoading = false;
          this.message = 'OTP sent to your email successfully';
          this.isError = false;
          this.cdr.detectChanges(); // Force UI to update
        },
        error: (err) => {
          console.error('OTP Request failed:', err);
          this.message = 'User not found or service unavailable';
          this.isError = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onOtpSubmit() {
    if (this.otpForm.valid) {
      this.step = 3;
      this.message = '';
      this.cdr.detectChanges();
    }
  }

  onPasswordSubmit() {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      const data = {
        email: this.emailForm.value.email,
        otp: this.otpForm.value.otp,
        newPassword: this.passwordForm.value.password
      };
      this.authService.resetPassword(data).subscribe({
        next: () => {
          this.message = 'Password reset successful! Redirecting...';
          this.isError = false;
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        },
        error: () => {
          this.message = 'Invalid OTP or expired. Please try again.';
          this.isError = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
