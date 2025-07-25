import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit {
  editForm!: FormGroup;
  showSpinner: boolean = false;
  errorMessage: string = '';

  minDate: string = '1900-01-01';
  maxDate: string = '';

  currentUser: any = null;

  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];

    const loggedInUsername = localStorage.getItem('loggedInUser');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    this.currentUser = users.find((u: any) => u.username === loggedInUsername);

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.editForm = this.fb.group({
      email: [this.currentUser.email, [Validators.required, Validators.email]],
      username: [{ value: this.currentUser.username, disabled: true }],
      password: [null],
      verifyPassword: [null],
      firstName: [this.currentUser.firstName, [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-z]+$/)]],
      lastName: [this.currentUser.lastName, [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-z]+$/)]],
      birthday: [this.currentUser.birthday, [Validators.required]],
    });
  }

  onSubmit(): void {
    this.showSpinner = true;

    let {
      email,
      password,
      verifyPassword,
      firstName,
      lastName,
      birthday
    } = this.editForm.getRawValue();

    const ageValid = this.checkAgeRange(birthday, 18, 65);

    if (password && verifyPassword) {

      const passwordValid = password.length >= 6 && /\d/.test(password);
      const passwordsMatch = password === verifyPassword;

      if (!passwordValid) {
        this.errorMessage = 'Password must be at least 6 characters and include a number.';
        this.showSpinner = false;
        return;
      }

      if (!passwordsMatch) {
        this.errorMessage = 'Passwords do not match.';
        this.showSpinner = false;
        return;
      }
    } else {
      password = this.currentUser.password;
    }

    if (!ageValid) {
      this.errorMessage = 'You must be between 18 and 65 years old.';
      this.showSpinner = false;
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.username === this.currentUser.username) {
        return {
          ...u,
          email,
          password,
          firstName,
          lastName,
          birthday
        };
      }
      return u;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));

    this.showSpinner = false;
    this.router.navigate(['/home']);
  }

  cancel(): void {
    this.router.navigate(['/home']);
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
    const control = this.editForm.get('birthday');
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