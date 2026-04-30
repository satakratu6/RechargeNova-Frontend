import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    const mockResponse: AuthResponse = {
      userId: 1,
      email: 'test@example.com',
      role: 'USER',
      token: 'mock-token'
    };

    service.login({ email: 'test@example.com', password: 'password' }).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8989/users/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should logout successfully', () => {
    const mockResponse: AuthResponse = {
      userId: 1,
      email: 'test@example.com',
      role: 'USER',
      token: 'mock-token'
    };

    // Set logged in state in localStorage
    localStorage.setItem('recharge_nova_auth', JSON.stringify(mockResponse));
    
    // Recreate service using HttpClient from TestBed
    service = new AuthService(TestBed.inject(HttpClient));
    
    expect(service.isAuthenticated()).toBe(true);
    
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('recharge_nova_auth')).toBeNull();
  });

  it('should register successfully', () => {
    const mockRequest = { name: 'Test', email: 'test@example.com', password: 'password', phoneNumber: '1234567890' };
    service.register(mockRequest).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:8989/users/register');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should forgotPassword successfully', () => {
    service.forgotPassword('test@example.com').subscribe(response => {
      expect(response).toBe('Email sent');
    });

    const req = httpMock.expectOne('http://localhost:8989/users/forgot-password');
    expect(req.request.method).toBe('POST');
    req.flush('Email sent');
  });

  it('should resetPassword successfully', () => {
    service.resetPassword({ token: '123', password: 'new' }).subscribe(response => {
      expect(response).toBe('Password reset');
    });

    const req = httpMock.expectOne('http://localhost:8989/users/reset-password');
    expect(req.request.method).toBe('POST');
    req.flush('Password reset');
  });

  it('should update user when logged in', () => {
    const mockResponse: AuthResponse = {
      userId: 1,
      email: 'test@example.com',
      role: 'USER',
      token: 'mock-token'
    };
    service.updateUser(mockResponse); // Should do nothing because not logged in

    // Log in first
    localStorage.setItem('recharge_nova_auth', JSON.stringify(mockResponse));
    service = new AuthService(TestBed.inject(HttpClient));

    service.updateUser({ email: 'new@example.com' });
    expect(service.currentUser()?.email).toBe('new@example.com');
  });

  it('should get token', () => {
    expect(service.getToken()).toBeNull();

    const mockResponse: AuthResponse = {
      userId: 1,
      email: 'test@example.com',
      role: 'USER',
      token: 'mock-token'
    };
    localStorage.setItem('recharge_nova_auth', JSON.stringify(mockResponse));
    service = new AuthService(TestBed.inject(HttpClient));

    expect(service.getToken()).toBe('mock-token');
  });
});
