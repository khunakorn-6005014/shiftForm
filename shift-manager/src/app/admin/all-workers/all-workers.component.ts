// src/app/admin/all-workers/all-workers.component.ts
import { Component, OnInit }      from '@angular/core';
import { CommonModule }            from '@angular/common';
import { Router, RouterModule }    from '@angular/router';
import { FormsModule } from '@angular/forms';
interface Worker {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  birthday: string;   // ISO date "YYYY-MM-DD"
}

@Component({
  selector: 'app-all-workers',
  standalone: true,
  imports: [CommonModule,FormsModule, RouterModule],
  templateUrl: './all-workers.component.html',
  styleUrls: ['./all-workers.component.scss']
})
export class AllWorkersComponent implements OnInit {
  currentAdminName = '';
  workers: Worker[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // 1) verify admin & grab name
    const rawLogged = localStorage.getItem('loggedInUser');
    if (!rawLogged) {
      this.router.navigate(['/admin/login']);
      return;
    }

    // 2) load all workers
    const raw = localStorage.getItem('users') || '[]';
    this.workers = JSON.parse(raw) as Worker[];
  }

  editWorker(username: string) {
    this.router.navigate(
      ['/admin/worker'],
      { queryParams: { username } }
    );
  }
goToShifts() {
  this.router.navigate(['/admin/shifts']);
}

goToWorkers() {
  this.router.navigate(['/admin/workers']);
}
  logout() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('loginTimestamp');
    this.router.navigate(['/admin/login']);
  }
}