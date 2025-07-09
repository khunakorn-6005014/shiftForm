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
      firstName:       ['', [Validators.required, Validators.minLength(2)]],
      lastName:        ['', [Validators.required, Validators.minLength(2)]],
      birthday:        ['', Validators.required]
    }, {
      validators: [ 
        this.passwordsMatchValidator,
        this.ageRangeValidator(18, 65)
      ]
    });

    // Load the worker to edit
    const username = this.route.snapshot.queryParamMap.get('username');
    const rawUsers = localStorage.getItem('users') || '[]';
    const users: Worker[] = JSON.parse(rawUsers);

    if (!username) {
      this.router.navigate(['/admin']);
      return;
    }

    const worker = users.find(u => u.username === username);
    if (!worker) {
      this.router.navigate(['/admin']);
      return;
    }

    this.originalUsername = worker.username;

    // Pre-fill form (leave password blank)
    this.form.patchValue({
      email:      worker.email,
      firstName:  worker.firstName,
      lastName:   worker.lastName,
      birthday:   worker.birthday
    });
  }

  // Navigate to filter-shifts for this worker
  filterShifts() {
    this.router.navigate(['/admin/shifts'], {
      queryParams: { name: this.originalUsername }
    });
  }

  // Update the worker record
  updateWorker() {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const vals = this.form.value;
    const rawUsers = localStorage.getItem('users') || '[]';
    const users: Worker[] = JSON.parse(rawUsers);

    // Check for username conflicts if username could change (skipped here)

    // Build updated worker
    const updated: Worker = {
      email:     vals.email,
      username:  this.originalUsername,
      password:  vals.password || 
                 users.find(u => u.username === this.originalUsername)!.password,
      firstName: vals.firstName,
      lastName:  vals.lastName,
      birthday:  vals.birthday
    };

    // Replace in array
    const idx = users.findIndex(u => u.username === this.originalUsername);
    users[idx] = updated;
    this.showSpinner = true;

    // Simulate server latency
    setTimeout(() => {
      localStorage.setItem('users', JSON.stringify(users));
      this.showSpinner = false;
      this.router.navigate(['/admin']);
    }, 500);
  }

  // Delete this worker
  deleteWorker() {
    if (!confirm('Are you sure you want to delete this worker?')) return;

    const rawUsers = localStorage.getItem('users') || '[]';
    let users: Worker[] = JSON.parse(rawUsers);
    users = users.filter(u => u.username !== this.originalUsername);

    localStorage.setItem('users', JSON.stringify(users));
    this.router.navigate(['/admin']);
  }
  logout()       { 
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']); 
  }
  // ---- Validators ----

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
      return (age < min || age > max) ? { invalidAge: true } : null;
    };
  }

  // getters for template
  get email()     { return this.form.get('email'); }
  get password()  { return this.form.get('password'); }
  get verifyPwd() { return this.form.get('verifyPassword'); }
  get firstName() { return this.form.get('firstName'); }
  get lastName()  { return this.form.get('lastName'); }
  get birthday()  { return this.form.get('birthday'); }
  
}