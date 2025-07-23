import { Component, OnInit }                   from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { CommonModule }                         from '@angular/common';
import { ReactiveFormsModule }                  from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

interface Worker {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  birthday: string;   // "YYYY-MM-DD"
}

@Component({
  selector: 'app-edit-worker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-worker.component.html',
  styleUrls: ['./edit-worker.component.scss']
})
export class EditWorkerComponent implements OnInit {
  form!: FormGroup;
  showSpinner = false;
  originalUsername: string = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Build the form
    this.form = this.fb.group({
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', Validators.minLength(6)],
      verifyPassword:  [''],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-z]+$/)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-z]+$/)]],
      birthday:        ['', Validators.required]
    }, {
      validators: [ 
        this.passwordsMatchValidator,
        this.ageRangeValidator(18, 65)
      ]
    });

    // Load the worker to edit
    const username = this.route.snapshot.queryParamMap.get('username');
    if (!username) {
      this.router.navigate(['/admin/home']);
      return;
    }
    this.originalUsername = username;

    const users: Worker[] = JSON.parse(localStorage.getItem('users') || '[]');
    const worker = users.find(u => u.username === username);
    if (!worker) {
      this.router.navigate(['/admin/home']);
      return;
    }

    // Pre-fill form (leave password blank)
    this.form.patchValue({
      email:      worker.email,
      firstName:  worker.firstName,
      lastName:   worker.lastName,
      birthday:   worker.birthday
    });
  }

  // Navigate to filter-shifts for this worker**
   filterShifts() {
    this.router.navigate(
      ['/admin/filter'],
      { queryParams: { username: this.originalUsername } }
    );
  }


  // Update the worker record
  // -- ACTIONS --
  updateWorker() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.showSpinner = true;
    const vals = this.form.value;
    const users: Worker[] = JSON.parse(localStorage.getItem('users') || '[]');

    // Build updated record
    const existing = users.find(u => u.username === this.originalUsername)!;
    const updated: Worker = {
      ...existing,
      email:     vals.email,
      password:  vals.password || existing.password,
      firstName: vals.firstName,
      lastName:  vals.lastName,
      birthday:  vals.birthday
    };

    // Replace and save
    const idx = users.findIndex(u => u.username === this.originalUsername);
    users[idx] = updated;
    setTimeout(() => {
      localStorage.setItem('users', JSON.stringify(users));
      this.showSpinner = false;
      this.router.navigate(['/admin/home']);
    }, 500);
  }


  // Delete this worker
 deleteWorker() {
    if (!confirm('Delete this worker?')) return;
    let users: Worker[] = JSON.parse(localStorage.getItem('users') || '[]');
    users = users.filter(u => u.username !== this.originalUsername);
    localStorage.setItem('users', JSON.stringify(users));
    this.router.navigate(['/admin/home']);
  }

goToShifts() {
  this.router.navigate(['/admin/shifts']);
}

goToWorkers() {
  this.router.navigate(['/admin/workers']);
}

  logout()       { 
    localStorage.removeItem('loggedInUser');
     localStorage.removeItem('loginTimestamp');
    this.router.navigate(['/admin/login']); 
  }

  // -- VALIDATORS --
  private passwordsMatchValidator(group: AbstractControl): ValidationErrors|null {
    const pw = group.get('password')?.value;
    const vp = group.get('verifyPassword')?.value;
    return pw && vp && pw !== vp ? { passwordMismatch: true } : null;
  }

  private ageRangeValidator(min: number, max: number) {
    return (group: AbstractControl): ValidationErrors|null => {
      const b = group.get('birthday')?.value;
      if (!b) return null;
      const birth = new Date(b);
      let age = new Date().getFullYear() - birth.getFullYear();
      const m = new Date().getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && new Date().getDate() < birth.getDate())) {
        age--;
      }
      return age < min || age > max ? { invalidAge: true } : null;
    };
  }

  // getters for template
  get email()      { return this.form.get('email'); }
  get password()   { return this.form.get('password'); }
  get verifyPwd()  { return this.form.get('verifyPassword'); }
  get firstName()  { return this.form.get('firstName'); }
  get lastName()   { return this.form.get('lastName'); }
  get birthday()   { return this.form.get('birthday'); }
}

