import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { DocumentType } from '../../core/models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  loading = false;

  readonly documentTypes: { value: DocumentType; label: string }[] = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PAS', label: 'Pasaporte' },
  ];

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    lastname: ['', [Validators.required, Validators.minLength(2)]],
    documentType: ['CC' as DocumentType, [Validators.required]],
    documentNumber: ['', [Validators.required, Validators.pattern(/^\d{4,15}$/)]],
    country: ['Colombia', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    try {
      await this.auth.register(this.form.getRawValue());
      await this.toast('Cuenta creada con éxito', 'success');
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (e: unknown) {
      console.error('[Register] error', e);
      await this.toast(this.parseError(e), 'danger');
    } finally {
      this.loading = false;
    }
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  private parseError(e: unknown): string {
    const code = (e as { code?: string })?.code ?? '';
    const message = (e as { message?: string })?.message ?? '';
    if (code.includes('email-already-in-use')) return 'El email ya está registrado';
    if (code.includes('weak-password')) return 'Contraseña débil (mín. 6 caracteres)';
    if (code.includes('invalid-email')) return 'Email inválido';
    if (code.includes('permission-denied')) return 'Firestore: permisos denegados (revisa las reglas)';
    if (code.includes('unavailable')) return 'Firestore no disponible (¿base de datos creada?)';
    return message || code || 'No se pudo crear la cuenta';
  }

  private async toast(message: string, color: 'success' | 'danger'): Promise<void> {
    const t = await this.toastCtrl.create({ message, duration: 2500, color });
    await t.present();
  }
}
