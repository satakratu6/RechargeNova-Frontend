export interface RechargeRequest {
  operatorId: number;
  planId: number;
  mobileNumber: string;
  paymentMethod: string;
}

export interface RechargeResponse {
  id: number;
  userId: number;
  operatorId: number;
  planId: number;
  mobileNumber: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: string;
  message: string;
}
