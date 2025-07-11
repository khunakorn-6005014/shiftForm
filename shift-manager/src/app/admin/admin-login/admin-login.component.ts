import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements OnInit {
  loginForm!: FormGroup;
  showSpinner: boolean = false;
  errorMessage: string = '';

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  goRegistration(): void {
    window.location.href = 'admin/registration';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter valid username and password (at least 6 characters).';
      return;
    }

    this.showSpinner = true;

    const { username, password } = this.loginForm.value;

    const usernameValid = /^[A-Za-z0-9\W]{6,}$/.test(username!) && /[^A-Za-z0-9]/.test(username!) && /\d/.test(username!);
    const passwordValid = password!.length >= 6;

    if (!usernameValid) {
      this.showSpinner = false;
      this.errorMessage = 'Username must be at least 6 characters and include at least one number and special character.';
      return;
    }

    if (!passwordValid) {
      this.showSpinner = false;
      this.errorMessage = 'Password must be at least 6 characters long.';
      return;
    }

    // Get adminUsers from local storage
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');

    const foundUser = adminUsers.find(
      (user: any) => user.username === username && user.password === password
    );

    if (foundUser) {
      localStorage.setItem('loginTimestamp', new Date().getTime().toString());
      localStorage.setItem('loggedInUser', foundUser.username);

      window.location.href = 'admin/home';
    } else {
      this.errorMessage = 'Invalid username or password.';
    }
    this.showSpinner = false;
  }
}