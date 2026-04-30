import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RechargeService } from './recharge.service';
import { RechargeRequest, RechargeResponse } from '../models/recharge.model';

describe('RechargeService', () => {
  let service: RechargeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RechargeService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(RechargeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initiate recharge', () => {
    const mockRequest: RechargeRequest = {
      mobileNumber: '1234567890',
      operatorId: 1,
      planId: 1,
      paymentMethod: 'UPI'
    };
    const mockResponse: RechargeResponse = {
      id: 1,
      userId: 1,
      mobileNumber: '1234567890',
      operatorId: 1,
      planId: 1,
      amount: 199,
      status: 'SUCCESS',
      createdAt: '2026-04-28',
      message: 'Recharge successful'
    };

    service.initiateRecharge(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8989/recharges');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should get recharge by id', () => {
    const mockResponse: RechargeResponse = {
      id: 1,
      userId: 1,
      mobileNumber: '1234567890',
      operatorId: 1,
      planId: 1,
      amount: 199,
      status: 'SUCCESS',
      createdAt: '2026-04-28',
      message: 'Recharge successful'
    };

    service.getRechargeById(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8989/recharges/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get recharges by user id', () => {
    const mockResponse: RechargeResponse[] = [{
      id: 1,
      userId: 1,
      mobileNumber: '1234567890',
      operatorId: 1,
      planId: 1,
      amount: 199,
      status: 'SUCCESS',
      createdAt: '2026-04-28',
      message: 'Recharge successful'
    }];

    service.getRechargesByUserId(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8989/recharges/user/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get all recharges for admin', () => {
    const mockResponse: RechargeResponse[] = [{
      id: 1,
      userId: 1,
      mobileNumber: '1234567890',
      operatorId: 1,
      planId: 1,
      amount: 199,
      status: 'SUCCESS',
      createdAt: '2026-04-28',
      message: 'Recharge successful'
    }];

    service.getAllRecharges().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8989/recharges/admin/all');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
