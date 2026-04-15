import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  loading = false;

  form = this.fb.nonNullable.group({
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
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (e: unknown) {
      await this.showError(this.parseError(e));
    } finally {
      this.loading = false;
    }
  }

  goToRegister(): void {
    this.router.navigateByUrl('/register');
  }

  private parseError(e: unknown): string {
    const code = (e as { code?: string })?.code ?? '';
    if (code.includes('invalid-credential') || code.includes('wrong-password')) {
      return 'Credenciales incorrectas';
    }
    if (code.includes('user-not-found')) return 'Usuario no encontrado';
    return 'No se pudo iniciar sesión';
  }

  private async showError(message: string): Promise<void> {
    const t = await this.toastCtrl.create({ message, duration: 2500, color: 'danger' });
    await t.present();
  }
}
