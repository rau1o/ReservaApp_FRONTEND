export interface LoginRequest  { email: string; password: string; }
export interface LoginResponse { token: string; nombre: string; rol: string; expiracion: string; }

export interface Cliente {
  id: number; nombre: string; apellido: string;
  telefono: string; email: string; activo: boolean; creadoEn: string;
}
export interface ClienteRequest {
  nombre: string; apellido: string; telefono: string; email: string;
}

export interface Servicio {
  id: number; nombre: string; descripcion: string;
  duracionMin: number; precio: number; activo: boolean;
}
export interface ServicioRequest {
  nombre: string; descripcion: string; duracionMin: number; precio: number;
}

export type EstadoReserva = 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';

export interface Reserva {
  id: number; clienteId: number; clienteNombre: string;
  servicioId: number; servicioNombre: string;
  fechaHora: string; estado: EstadoReserva; notas?: string; creadoEn: string;
}
export interface ReservaRequest {
  clienteId: number; servicioId: number; fechaHora: string; notas?: string;
}

export interface PagedResult<T> {
  items: T[]; total: number; pagina: number; tamanoPag: number; totalPags: number;
}
export interface QueryParams {
  pagina?: number; tamanoPag?: number; buscar?: string; orden?: string; asc?: boolean;
}
export interface ReservaQueryParams extends QueryParams {
  estado?: string; fechaDesde?: string; fechaHasta?: string; clienteId?: number;
}

