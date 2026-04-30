import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Operator, Plan } from '../models/operator.model';

@Injectable({
  providedIn: 'root'
})
export class OperatorService {
  private readonly BASE_URL = '/api'; // Gateway URL

  constructor(private http: HttpClient) {}

  getOperators(): Observable<Operator[]> {
    return this.http.get<Operator[]>(`${this.BASE_URL}/operators`);
  }

  getOperatorById(id: number): Observable<Operator> {
    return this.http.get<Operator>(`${this.BASE_URL}/operators/${id}`);
  }

  getPlanById(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.BASE_URL}/plans/${id}`);
  }

  // Admin Methods
  createOperator(operator: Partial<Operator>): Observable<Operator> {
    return this.http.post<Operator>(`${this.BASE_URL}/operators`, operator);
  }

  updateOperator(id: number, operator: Partial<Operator>): Observable<Operator> {
    return this.http.put<Operator>(`${this.BASE_URL}/operators/${id}`, operator);
  }

  deleteOperator(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/operators/${id}`);
  }

  createPlan(operatorId: number, plan: Partial<Plan>): Observable<Plan> {
    return this.http.post<Plan>(`${this.BASE_URL}/operators/${operatorId}/plans`, plan);
  }

  updatePlan(id: number, plan: Partial<Plan>): Observable<Plan> {
    return this.http.put<Plan>(`${this.BASE_URL}/plans/${id}`, plan);
  }

  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/plans/${id}`);
  }
}
