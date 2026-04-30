import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: any;
  let router: Router;

  beforeEach(async () => {
    authService = {
      login: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.loginForm.get('email')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should validate email field', () => {
    const email = component.loginForm.get('email');
    email?.setValue('invalid-email');
    expect(email?.valid).toBeFalsy();
    expect(email?.hasError('email')).toBeTruthy();

    email?.setValue('test@example.com');
    expect(email?.valid).toBeTruthy();
  });

  it('should validate password length', () => {
    const password = component.loginForm.get('password');
    password?.setValue('123');
    expect(password?.valid).toBeFalsy();
    expect(password?.hasError('minlength')).toBeTruthy();

    password?.setValue('123456');
    expect(password?.valid).toBeTruthy();
  });

  it('should navigate to dashboard on successful login', () => {
    component.loginForm.get('email')?.setValue('test@example.com');
    component.loginForm.get('password')?.setValue('password');
    
    authService.login.mockReturnValue(of({ token: 'mock-token' }));
    
    component.onSubmit();
    
    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to admin dashboard on successful admin login', () => {
    component.loginForm.get('email')?.setValue('admin@rechargenova.com');
    component.loginForm.get('password')?.setValue('adminPassword123');
    
    authService.login.mockReturnValue(of({ token: 'mock-token', role: 'ADMIN' }));
    
    component.onSubmit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should show error on failed login', () => {
    component.loginForm.get('email')?.setValue('test@example.com');
    component.loginForm.get('password')?.setValue('password');
    
    authService.login.mockReturnValue(throwError(() => new Error('Login failed')));
    
    component.onSubmit();
    fixture.detectChanges();
    
    expect(component.errorMsg).toBe('Invalid email or password. Please try again.');
    expect(component.isLoading).toBeFalsy();
    expect(fixture.nativeElement.textContent).toContain('Invalid email or password');
  });

  it('should toggle password visibility', () => {
    expect(component.showPw).toBeFalsy();
    
    const button = fixture.nativeElement.querySelector('button[type="button"]');
    button.click();
    fixture.detectChanges();
    expect(component.showPw).toBeTruthy();

    button.click();
    fixture.detectChanges();
    expect(component.showPw).toBeFalsy();
  });

  it('should show required error for email in template', () => {
    const email = component.loginForm.get('email');
    email?.markAsTouched();
    email?.setValue('');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Email is required');
  });

  it('should show invalid error for email in template', () => {
    const email = component.loginForm.get('email');
    email?.markAsTouched();
    email?.setValue('invalid-email');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Please enter a valid email');
  });

  it('should show required error for password in template', () => {
    const password = component.loginForm.get('password');
    password?.markAsTouched();
    password?.setValue('');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Password is required');
  });

  it('should show minlength error for password in template', () => {
    const password = component.loginForm.get('password');
    password?.markAsTouched();
    password?.setValue('123');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Password must be at least 6 characters');
  });
});
