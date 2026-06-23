import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Servicio, ServicioRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class ServicioService {
  private url = `${environment.apiUrl}/servicios`;

  constructor(private http: HttpClient) {}

  getAll(soloActivos = true) {
    return this.http.get<Servicio[]>(`${this.url}?soloActivos=${soloActivos}`);
  }

  getById(id: number) {
    return this.http.get<Servicio>(`${this.url}/${id}`);
  }

  create(dto: ServicioRequest) {
    return this.http.post<Servicio>(this.url, dto);
  }

  update(id: number, dto: ServicioRequest) {
    return this.http.put<Servicio>(`${this.url}/${id}`, dto);
  }

  toggle(id: number) {
    return this.http.patch<void>(`${this.url}/${id}/toggle`, {});
  }
}
