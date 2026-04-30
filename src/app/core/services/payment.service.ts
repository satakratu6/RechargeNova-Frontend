import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentResponse {
  id: number;
  rechargeId: number;
  userId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly BASE_URL = '/api/api/payments';

  constructor(private http: HttpClient) {}

  getAllPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.BASE_URL}/admin/all`);
  }

  getPaymentById(id: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.BASE_URL}/${id}`);
  }

  getPaymentsByUserId(userId: number): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.BASE_URL}/user/${userId}`);
  }

  createOrder(amount: number): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/create-order`, { amount });
  }

  verifyPayment(verifyRequest: any): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.BASE_URL}/verify`, verifyRequest);
  }

}
