import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente, ClienteRequest, QueryParams } from '../../../core/models';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Clientes</h2>
      <button class="btn-primary" (click)="openForm()">+ Nuevo cliente</button>
    </div>

    <div class="filters-bar">
      <input type="text" [(ngModel)]="buscar" (input)="onSearch()"
             placeholder="Buscar por nombre, email o teléfono..." class="search-input" />
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th (click)="ordenar('nombre')" class="sortable">Nombre ⇅</th>
            <th>Teléfono</th>
            <th (click)="ordenar('email')" class="sortable">Email ⇅</th>
            <th>Estado</th>
            <th>Registrado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (c of clientes(); track c.id) {
            <tr>
              <td>{{ c.id }}</td>
              <td><strong>{{ c.nombre }} {{ c.apellido }}</strong></td>
              <td>{{ c.telefono }}</td>
              <td>{{ c.email }}</td>
              <td><span class="badge" [class.activo]="c.activo" [class.inactivo]="!c.activo">
                {{ c.activo ? 'Activo' : 'Inactivo' }}</span></td>
              <td>{{ c.creadoEn | date:'dd/MM/yyyy' }}</td>
              <td class="actions">
                <button class="btn-icon" (click)="openForm(c)" title="Editar">✏️</button>
                <button class="btn-icon" (click)="eliminar(c)" title="Desactivar">🗑</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="empty">No se encontraron clientes.</td></tr>
          }
        </tbody>
      </table>
    </div>

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
          <h3>{{ editando() ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Nombre *</label>
              <input [(ngModel)]="form.nombre" placeholder="Juan" />
            </div>
            <div class="form-group">
              <label>Apellido *</label>
              <input [(ngModel)]="form.apellido" placeholder="Pérez" />
            </div>
          </div>
          <div class="form-group">
            <label>Teléfono *</label>
            <input [(ngModel)]="form.telefono" placeholder="+591 70000000" />
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input type="email" [(ngModel)]="form.email" placeholder="juan@email.com" />
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
export class ClientesListComponent implements OnInit {
  private svc = inject(ClienteService);

  clientes  = signal<Cliente[]>([]);
  pagina    = signal(1);
  totalPags = signal(1);

  showForm  = signal(false);
  editando  = signal(false);
  saving    = signal(false);
  formError = signal('');

  buscar = '';
  orden  = 'id';
  asc    = true;

  editId = 0;
  form: ClienteRequest = { nombre: '', apellido: '', telefono: '', email: '' };

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit() { this.cargar(); }

  cargar() {
    const q: QueryParams = { pagina: this.pagina(), tamanoPag: 10, buscar: this.buscar, orden: this.orden, asc: this.asc };
    this.svc.getAll(q).subscribe(r => {
      this.clientes.set(r.items);
      this.totalPags.set(r.totalPags);
    });
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.pagina.set(1); this.cargar(); }, 350);
  }

  ordenar(campo: string) {
    if (this.orden === campo) this.asc = !this.asc;
    else { this.orden = campo; this.asc = true; }
    this.cargar();
  }

  irPagina(p: number) { this.pagina.set(p); this.cargar(); }

  openForm(c?: Cliente) {
    this.formError.set('');
    if (c) {
      this.editando.set(true);
      this.editId = c.id;
      this.form   = { nombre: c.nombre, apellido: c.apellido, telefono: c.telefono, email: c.email };
    } else {
      this.editando.set(false);
      this.editId = 0;
      this.form   = { nombre: '', apellido: '', telefono: '', email: '' };
    }
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  guardar() {
    if (!this.form.nombre || !this.form.apellido || !this.form.telefono || !this.form.email) {
      this.formError.set('Todos los campos son obligatorios.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');

    const call = this.editando()
      ? this.svc.update(this.editId, this.form)
      : this.svc.create(this.form);

    call.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.cargar(); },
      error: (e) => { this.saving.set(false); this.formError.set(e.error?.error ?? 'Error al guardar.'); }
    });
  }

  eliminar(c: Cliente) {
    if (!confirm(`¿Desactivar a ${c.nombre} ${c.apellido}?`)) return;
    this.svc.delete(c.id).subscribe(() => this.cargar());
  }
}
