import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { BiometricService } from '../../core/services/biometric.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private biometric = inject(BiometricService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  loading = false;
  biometricReady = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async ngOnInit(): Promise<void> {
    if (!(await this.biometric.isAvailable())) return;
    const creds = await this.biometric.getCredentials();
    this.biometricReady = !!creds;
  }

  async loginWithBiometric(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    try {
      const verified = await this.biometric.verify('Inicia sesión con biometría');
      if (!verified) return;
      const creds = await this.biometric.getCredentials();
      if (!creds) {
        await this.showError('Sin credenciales guardadas');
        return;
      }
      await this.auth.login(creds.username, creds.password);
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (e: unknown) {
      await this.showError(this.parseError(e));
    } finally {
      this.loading = false;
    }
  }

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
