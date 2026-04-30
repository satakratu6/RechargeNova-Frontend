import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RechargeRequest, RechargeResponse } from '../models/recharge.model';

@Injectable({
  providedIn: 'root'
})
export class RechargeService {
  private readonly BASE_URL = 'http://localhost:8989/recharges';

  constructor(private http: HttpClient) {}

  initiateRecharge(request: RechargeRequest): Observable<RechargeResponse> {
    return this.http.post<RechargeResponse>(this.BASE_URL, request);
  }

  getRechargeById(id: number): Observable<RechargeResponse> {
    return this.http.get<RechargeResponse>(`${this.BASE_URL}/${id}`);
  }

  getRechargesByUserId(userId: number): Observable<RechargeResponse[]> {
    return this.http.get<RechargeResponse[]>(`${this.BASE_URL}/user/${userId}`);
  }

  getAllRecharges(): Observable<RechargeResponse[]> {
    return this.http.get<RechargeResponse[]>(`${this.BASE_URL}/admin/all`);
  }
}
