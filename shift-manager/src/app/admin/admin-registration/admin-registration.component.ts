import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './admin-registration.component.html',
  styleUrl: './admin-registration.component.scss'
})
export class AdminRegistrationComponent implements OnInit {
  registerForm!: FormGroup;
  showSpinner: boolean = false;
  errorMessage: string = '';

  minDate: string = '1900-01-01';
  maxDate: string = '';

  isValid = {
    email: false,
    username: false,
    password: false,
    verifyPassword: false,
    firstName: false,
    lastName: false,
    birthday: false,
  };

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      verifyPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-z]+$/)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-z]+$/)]],
      birthday: ['', [Validators.required]],
    });

    this.registerForm.valueChanges.subscribe(() => {
      const {
        email,
        username,
        password,
        verifyPassword,
        firstName,
        lastName,
        birthday,
      } = this.registerForm.value;

      this.isValid.email = !!email && /\S+@\S+\.\S+/.test(email);
      this.isValid.username =
        !!username &&
        username.length >= 6 &&
        /[^A-Za-z0-9]/.test(username) &&
        /\d/.test(username);

      this.isValid.password = !!password && password.length >= 6 && /\d/.test(password);
      this.isValid.verifyPassword = password === verifyPassword && !!password && !!verifyPassword;
      this.isValid.firstName = !!firstName && firstName.length >= 2;
      this.isValid.lastName = !!lastName && lastName.length >= 2;
      this.isValid.birthday = !!birthday && this.checkAgeRange(birthday, 18, 65);
    });
  }


  onSubmit(): void {

    this.showSpinner = true;

    const {
      email,
      username,
      password,
      verifyPassword,
      firstName,
      lastName,
      birthday,
    } = this.registerForm.value;

    const usernameValid = /^[A-Za-z0-9\W]{6,}$/.test(username!) && /[^A-Za-z0-9]/.test(username!) && /\d/.test(username!);
    const passwordValid = password.length >= 6;
    const passwordsMatch = password === verifyPassword;
    const ageValid = this.checkAgeRange(birthday, 18, 65);

    if (!usernameValid) {
      this.errorMessage = 'Username must be at least 6 characters and include at least one number and special character.';
      this.showSpinner = false;
      return;
    }

    if (!passwordValid) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      this.showSpinner = false;
      return;
    }

    if (!passwordsMatch) {
      this.errorMessage = 'Passwords do not match.';
      this.showSpinner = false;
      return;
    }

    if (!ageValid) {
      this.errorMessage = 'You must be between 18 and 65 years old.';
      this.showSpinner = false;
      return;
    }

    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      return;
    }

    const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const userExists = adminUsers.some((u: any) => u.username === username);

    if (userExists) {
      this.errorMessage = 'Username is already taken. Please choose another.';
      this.showSpinner = false;
      return;
    }

    const newUser = {
      email,
      username,
      password,
      firstName,
      lastName,
      birthday,
    };

    adminUsers.push(newUser);
    localStorage.setItem('adminUsers', JSON.stringify(adminUsers));

    this.showSpinner = false;
    window.location.href = 'admin/login';
  }

  checkAgeRange(dateString: string, min: number, max: number): boolean {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= min && age <= max;
  }

  validateBirthday(): void {
    const control = this.registerForm.get('birthday');
    const value = control?.value;

    if (!value) return;

    const inputDate = new Date(value);
    const minDate = new Date(this.minDate);
    const maxDate = new Date(this.maxDate);

    if (inputDate < minDate) {
      control?.setValue(this.minDate);
    } else if (inputDate > maxDate) {
      control?.setValue(this.maxDate);
    }
  }
}