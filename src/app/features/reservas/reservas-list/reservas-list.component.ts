import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../../../core/services/reserva.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ServicioService } from '../../../core/services/servicio.service';
import { Reserva, ReservaQueryParams, Cliente, Servicio } from '../../../core/models';

@Component({
  selector: 'app-reservas-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Reservas</h2>
      <button class="btn-primary" (click)="openForm()">+ Nueva reserva</button>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <input type="text" [(ngModel)]="filtroBuscar" placeholder="Buscar cliente o servicio..."
             (input)="onSearch()" class="search-input" />
      <select [(ngModel)]="filtroEstado" (change)="cargar()">
        <option value="">Todos los estados</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Confirmada">Confirmada</option>
        <option value="Cancelada">Cancelada</option>
        <option value="Completada">Completada</option>
      </select>
      <input type="date" [(ngModel)]="filtroFechaDesde" (change)="cargar()" />
      <input type="date" [(ngModel)]="filtroFechaHasta" (change)="cargar()" />
    </div>

    <!-- Tabla -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Fecha y Hora</th>
            <th>Estado</th>
            <th>Notas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (r of reservas(); track r.id) {
            <tr>
              <td>{{ r.id }}</td>
              <td>{{ r.clienteNombre }}</td>
              <td>{{ r.servicioNombre }}</td>
              <td>{{ r.fechaHora | date:'dd/MM/yyyy HH:mm' }}</td>
              <td><span class="badge" [ngClass]="'estado-' + r.estado.toLowerCase()">{{ r.estado }}</span></td>
              <td>{{ r.notas || '—' }}</td>
              <td class="actions">
                <button class="btn-icon" (click)="openForm(r)" title="Editar">✏️</button>
                <button class="btn-icon" (click)="cambiarEstado(r)" title="Cambiar estado">🔄</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="empty">No se encontraron reservas.</td></tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    @if (totalPags() > 1) {
      <div class="pagination">
        <button [disabled]="pagina() === 1" (click)="irPagina(pagina() - 1)">‹</button>
        <span>Página {{ pagina() }} de {{ totalPags() }}</span>
        <button [disabled]="pagina() === totalPags()" (click)="irPagina(pagina() + 1)">›</button>
      </div>
    }

    <!-- Modal Form -->
    @if (showForm()) {
      <div class="modal-overlay" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ editando() ? 'Editar Reserva' : 'Nueva Reserva' }}</h3>
          <div class="form-group">
            <label>Cliente</label>
            <select [(ngModel)]="formData.clienteId">
              <option [value]="0">Seleccionar...</option>
              @for (c of clientes(); track c.id) {
                <option [value]="c.id">{{ c.nombre }} {{ c.apellido }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label>Servicio</label>
            <select [(ngModel)]="formData.servicioId">
              <option [value]="0">Seleccionar...</option>
              @for (s of servicios(); track s.id) {
                <option [value]="s.id">{{ s.nombre }} ({{ s.duracionMin }} min)</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label>Fecha y Hora</label>
            <input type="datetime-local" [(ngModel)]="formData.fechaHora" />
          </div>
          <div class="form-group">
            <label>Notas</label>
            <textarea [(ngModel)]="formData.notas" rows="3" placeholder="Observaciones..."></textarea>
          </div>
          @if (formError()) {
            <div class="error">{{ formError() }}</div>
          }
          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeForm()">Cancelar</button>
            <button class="btn-primary" (click)="guardar()" [disabled]="saving()">
              {{ saving() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h2 { margin: 0; color: #1a1a1a; }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 200px; }
    input, select, textarea { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: .9rem; }
    .table-wrap { background: white; border-radius: 10px; box-shadow: 0 1px 8px rgba(0,0,0,.07); overflow: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8faff; color: #1B5FA8; font-weight: 600; padding: 12px 16px; text-align: left; font-size: .85rem; border-bottom: 2px solid #e8eef8; }
    td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: .9rem; }
    tr:hover td { background: #fafcff; }
    .empty { text-align: center; color: #999; padding: 40px !important; }
    .badge { padding: 4px 10px; border-radius: 20px; font-size: .78rem; font-weight: 600; }
    .estado-pendiente   { background: #fff8e1; color: #f57c00; }
    .estado-confirmada  { background: #e8f5e9; color: #2e7d32; }
    .estado-cancelada   { background: #fce4ec; color: #c62828; }
    .estado-completada  { background: #e3f2fd; color: #1565c0; }
    .actions { display: flex; gap: 6px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 4px; border-radius: 4px; }
    .btn-icon:hover { background: #f0f4f8; }
    .btn-primary { background: #1B5FA8; color: white; border: none; padding: 9px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .btn-primary:hover:not(:disabled) { background: #154d8a; }
    .btn-secondary { background: #f0f4f8; color: #333; border: none; padding: 9px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; }
    .pagination button { background: white; border: 1px solid #ddd; padding: 6px 14px; border-radius: 6px; cursor: pointer; }
    .pagination button:disabled { opacity: .4; cursor: not-allowed; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; padding: 32px; width: 480px; max-width: 95vw; }
    .modal h3 { margin: 0 0 24px; color: #1B5FA8; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: .85rem; font-weight: 600; color: #444; margin-bottom: 6px; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; box-sizing: border-box; }
    .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    .error { background: #fff0f0; color: #c0392b; padding: 10px; border-radius: 6px; margin-bottom: 12px; font-size: .85rem; }
  `]
})
export class ReservasListComponent implements OnInit {
  private reservaService  = inject(ReservaService);
  private clienteService  = inject(ClienteService);
  private servicioService = inject(ServicioService);

  // ── Estado reactivo (signals) ────────────────────────────────────────────
  reservas  = signal<Reserva[]>([]);
  clientes  = signal<Cliente[]>([]);
  servicios = signal<Servicio[]>([]);

  pagina    = signal(1);
  totalPags = signal(1);
  loading   = signal(false);

  showForm  = signal(false);
  editando  = signal(false);
  saving    = signal(false);
  formError = signal('');

  // Filtros: no necesitan ser signals porque solo se leen al llamar cargar(),
  // nunca directamente en el template con interpolación reactiva.
  filtroBuscar     = '';
  filtroEstado     = '';
  filtroFechaDesde = '';
  filtroFechaHasta = '';

  // formData tampoco necesita ser signal: ngModel + bindings de formulario
  // ya generan su propia notificación de change detection en cada evento
  // (input/change), no dependen de un signal externo para refrescar el DOM.
  formData = { clienteId: 0, servicioId: 0, fechaHora: '', notas: '' };
  editId   = 0;

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit() {
    this.cargar();
    this.clienteService.getAll({ tamanoPag: 100 }).subscribe(r => this.clientes.set(r.items));
    this.servicioService.getAll().subscribe(s => this.servicios.set(s));
  }

  cargar() {
    this.loading.set(true);
    const q: ReservaQueryParams = {
      pagina:     this.pagina(),
      tamanoPag:  10,
      buscar:     this.filtroBuscar || undefined,
      estado:     this.filtroEstado || undefined,
      fechaDesde: this.filtroFechaDesde || undefined,
      fechaHasta: this.filtroFechaHasta || undefined,
    };

    this.reservaService.getAll(q).subscribe({
      next: r => {
        this.reservas.set(r.items);
        this.totalPags.set(r.totalPags);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.pagina.set(1); this.cargar(); }, 350);
  }

  irPagina(p: number) { this.pagina.set(p); this.cargar(); }

  openForm(r?: Reserva) {
    this.formError.set('');
    if (r) {
      this.editando.set(true);
      this.editId   = r.id;
      this.formData = {
        clienteId:  r.clienteId,
        servicioId: r.servicioId,
        fechaHora:  r.fechaHora.slice(0, 16),
        notas:      r.notas ?? ''
      };
    } else {
      this.editando.set(false);
      this.editId   = 0;
      this.formData = { clienteId: 0, servicioId: 0, fechaHora: '', notas: '' };
    }
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  guardar() {
    if (!this.formData.clienteId || !this.formData.servicioId || !this.formData.fechaHora) {
      this.formError.set('Completa todos los campos obligatorios.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');

    const dto = {
      clienteId:  +this.formData.clienteId,
      servicioId: +this.formData.servicioId,
      fechaHora:  new Date(this.formData.fechaHora).toISOString(),
      notas:      this.formData.notas || undefined
    };

    const call = this.editando()
      ? this.reservaService.update(this.editId, dto)
      : this.reservaService.create(dto);

    call.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.cargar(); },
      error: (e) => {
        this.saving.set(false);
        this.formError.set(e.error?.error ?? 'Error al guardar.');
      }
    });
  }

  cambiarEstado(r: Reserva) {
    const estados = ['Pendiente', 'Confirmada', 'Completada', 'Cancelada'];
    const siguiente = estados[(estados.indexOf(r.estado) + 1) % estados.length];
    if (!confirm(`¿Cambiar estado a "${siguiente}"?`)) return;
    this.reservaService.cambiarEstado(r.id, siguiente).subscribe(() => this.cargar());
  }
}
