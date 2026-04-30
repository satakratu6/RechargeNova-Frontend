import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = authService.currentUser();
  
  if (user && user.role === 'ADMIN') {
    return true;
  }
  
  console.warn('Unauthorized access to admin route');
  router.navigate(['/dashboard']);
  return false;
};
