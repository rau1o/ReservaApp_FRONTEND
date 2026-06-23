import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Reserva, ReservaRequest, PagedResult, ReservaQueryParams } from '../models';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private url = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) {}

  getAll(q: ReservaQueryParams = {}) {
    let p = new HttpParams();
    if (q.pagina)      p = p.set('pagina',      q.pagina);
    if (q.tamanoPag)   p = p.set('tamanoPag',   q.tamanoPag);
    if (q.buscar)      p = p.set('buscar',       q.buscar);
    if (q.estado)      p = p.set('estado',       q.estado);
    if (q.clienteId)   p = p.set('clienteId',    q.clienteId);
    if (q.fechaDesde)  p = p.set('fechaDesde',   q.fechaDesde);
    if (q.fechaHasta)  p = p.set('fechaHasta',   q.fechaHasta);
    if (q.asc !== undefined) p = p.set('asc',    q.asc);
    return this.http.get<PagedResult<Reserva>>(this.url, { params: p });
  }

  getById(id: number) {
    return this.http.get<Reserva>(`${this.url}/${id}`);
  }

  create(dto: ReservaRequest) {
    return this.http.post<Reserva>(this.url, dto);
  }

  update(id: number, dto: ReservaRequest) {
    return this.http.put<Reserva>(`${this.url}/${id}`, dto);
  }

  cambiarEstado(id: number, estado: string) {
    return this.http.patch<Reserva>(`${this.url}/${id}/estado`, { estado });
  }
}
