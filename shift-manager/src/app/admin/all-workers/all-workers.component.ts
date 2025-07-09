// src/app/admin/all-workers/all-workers.component.ts
import { Component, OnInit }      from '@angular/core';
import { CommonModule }            from '@angular/common';
import { Router, RouterModule }    from '@angular/router';

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
  imports: [CommonModule, RouterModule],
  templateUrl: './all-workers.component.html',
  styleUrls: ['./all-workers.component.scss']
})
export class AllWorkersComponent implements OnInit {
  currentAdminName = '';
  workers: Worker[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // 1) verify admin & grab name
    const rawAdmins = localStorage.getItem('adminUsers') || '[]';
    const adminUsers: string[] = JSON.parse(rawAdmins);

    const rawLogged = localStorage.getItem('loggedInUser') || '';
    const loggedObj = rawLogged ? JSON.parse(rawLogged) : null;
    const username = loggedObj?.username;

    if (!username || !adminUsers.includes(username)) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentAdminName = username;

    // 2) load all workers
    const raw = localStorage.getItem('users') || '[]';
    this.workers = JSON.parse(raw) as Worker[];
  }



  editWorker(username: string) {
    this.router.navigate(
      ['/admin/edit-worker'],
      { queryParams: { username } }
    );
  }

  logout() {
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
  }
}