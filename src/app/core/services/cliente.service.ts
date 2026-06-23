import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cliente, ClienteRequest, PagedResult, QueryParams } from '../models';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private url = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getAll(q: QueryParams = {}) {
    const params = this.buildParams(q);
    return this.http.get<PagedResult<Cliente>>(this.url, { params });
  }

  getById(id: number) {
    return this.http.get<Cliente>(`${this.url}/${id}`);
  }

  create(dto: ClienteRequest) {
    return this.http.post<Cliente>(this.url, dto);
  }

  update(id: number, dto: ClienteRequest) {
    return this.http.put<Cliente>(`${this.url}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  private buildParams(q: QueryParams): HttpParams {
    let p = new HttpParams();
    if (q.pagina)    p = p.set('pagina',    q.pagina);
    if (q.tamanoPag) p = p.set('tamanoPag', q.tamanoPag);
    if (q.buscar)    p = p.set('buscar',    q.buscar);
    if (q.orden)     p = p.set('orden',     q.orden);
    if (q.asc !== undefined) p = p.set('asc', q.asc);
    return p;
  }
}

