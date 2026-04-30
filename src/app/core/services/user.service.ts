import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly BASE_URL = 'http://localhost:8989/users';

  constructor(private http: HttpClient) {}

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.BASE_URL}/${id}`);
  }

  uploadProfileImage(id: number, file: File): Observable<UserResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UserResponse>(`${this.BASE_URL}/${id}/upload-image`, formData);
  }
}
