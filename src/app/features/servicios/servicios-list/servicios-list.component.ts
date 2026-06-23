import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../../core/services/servicio.service';
import { Servicio, QueryParams,  ServicioRequest } from '../../../core/models';

@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Servicios</h2>
      <button class="btn-primary" (click)="openForm()">+ Nuevo servicio</button>
    </div>

    <div class="filters-bar">
      <label class="toggle-filter">
        <input type ="checkbox" [(ngModel)]="soloActivos" (change)="cargar()" />
        Mostrar solo los servicios activos
      </label>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Descripcion</th>
            <th>Duracion</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (s of servicios(); track s.id) {
            <tr>
              <td>{{ s.id }}</td>
              <td><strong>{{ s.nombre }}</strong></td>
              <td>{{ s.descripcion }}</td>
              <td>{{ s.duracionMin }} min</td>
              <td>{{ s.precio.toFixed(2) | currency:'USD' }}</td>
              <td>
                <span class="badge" [class.activo]="s.activo" [class.inactivo]="!s.activo">
                {{ s.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-icon" (click)="openForm(s)" title="Editar">✏️</button>
                <button class="btn-icon" (click)="toggle(s)" [title]="s.activo ? 'Desactivar' : 'Activar'">
                   {{ s.activo ? '⏸' : '▶️' }}
                </button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="empty">No se encontraron servicios.</td></tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    @if (showForm()) {
      <div class="modal-overlay" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ editando() ? 'Editar Servicio' : 'Nuevo Servicio' }}</h3>
            <div class="form-group">
              <label>Nombre *</label>
              <input [(ngModel)]="form.nombre" placeholder="Consulta General" />
            </div>
            <div class="form-group">
              <label>Descripción *</label>
              <input [(ngModel)]="form.descripcion" rows = "2" placeholder="Breve descripción del servicio" />
            </div>
          <div class="form-row">
            <div class="form-group">
              <label>Duración (minutos) *</label>
              <input type="number" min = "5" step = "5" [(ngModel)]="form.duracionMin" placeholder="30" />
            </div>
            <div class="form-group">
              <label>Precio (Bs)</label>
              <input type="number" min ="0" step="5" [(ngModel)]="form.precio" placeholder="150" />
            </div>
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
    h2 { margin: 0; }
    .filters-bar { margin-bottom: 20px; }
    .search-input { width: 360px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: .9rem; }
    .table-wrap { background: white; border-radius: 10px; box-shadow: 0 1px 8px rgba(0,0,0,.07); overflow: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8faff; color: #1B5FA8; font-weight: 600; padding: 12px 16px; text-align: left; font-size: .85rem; border-bottom: 2px solid #e8eef8; }
    th.sortable { cursor: pointer; user-select: none; }
    th.sortable:hover { color: #154d8a; }
    td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: .9rem; }
    tr:hover td { background: #fafcff; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: .78rem; font-weight: 600; }
    .activo   { background: #e8f5e9; color: #2e7d32; }
    .inactivo { background: #f5f5f5; color: #999; }
    .empty { text-align: center; color: #999; padding: 40px !important; }
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
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: .85rem; font-weight: 600; color: #444; margin-bottom: 6px; }
    .form-group input { width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; }
    .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    .error { background: #fff0f0; color: #c0392b; padding: 10px; border-radius: 6px; margin-bottom: 12px; font-size: .85rem; }
  `]
})
export class ServiciosListComponent implements OnInit {
  private svc = inject(ServicioService);

  servicios   = signal<Servicio[]>([]);
  soloActivos = false; // muestra todos por defecto en la vista de administración

  showForm  = signal(false);
  editando  = signal(false);
  saving    = signal(false);
  formError = signal('');
  editId = 0;
  form: ServicioRequest = { nombre: '', descripcion: '', duracionMin: 30, precio: 0 };

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit() { this.cargar(); }

  cargar() {
     this.svc.getAll(this.soloActivos).subscribe(s => this.servicios.set(s));
  }

  openForm(s?: Servicio) {
    this.formError.set('');
    if (s) {
      this.editando.set(true);
      this.editId = s.id;
      this.form   = {
        nombre:      s.nombre,
        descripcion: s.descripcion,
        duracionMin: s.duracionMin,
        precio:      s.precio
      };
    } else {
      this.editando.set(false);
      this.editId = 0;
      this.form   = { nombre: '', descripcion: '', duracionMin: 30, precio: 0 };
    }
    this.showForm.set(true)
  }

  closeForm() { this.showForm.set(false); }

  guardar() {
      if (!this.form.nombre || this.form.duracionMin <= 0 || this.form.precio < 0) {
      this.formError.set('Completa nombre, duración y precio con valores válidos.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');

    const dto: ServicioRequest = {
      nombre:      this.form.nombre,
      descripcion: this.form.descripcion,
      duracionMin: +this.form.duracionMin,
      precio:      +this.form.precio
    };

    const call = this.editando()
      ? this.svc.update(this.editId, dto)
      : this.svc.create(dto);

    call.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.cargar(); },
      error: (e) => { this.saving.set(false); this.formError.set(e.error?.error ?? 'Error al guardar.'); }
    });
  }

 toggle(s: Servicio) {
    const accion = s.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Seguro que quieres ${accion} "${s.nombre}"?`)) return;
    this.svc.toggle(s.id).subscribe(() => this.cargar());
  }
}
