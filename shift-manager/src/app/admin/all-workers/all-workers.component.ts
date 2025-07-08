import { Component, OnInit }    from '@angular/core';
import { CommonModule }          from '@angular/common';
import { Router, RouterModule }  from '@angular/router';

interface Worker {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  birthday: string;   // ISO date string, e.g. "1980-05-21"
}

@Component({
  selector: 'app-all-workers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './all-workers.component.html',
  styleUrls: ['./all-workers.component.scss']
})
export class AllWorkersComponent implements OnInit {
  workers: Worker[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const raw = localStorage.getItem('users') || '[]';
    this.workers = JSON.parse(raw) as Worker[];
  }

  editWorker(username: string) {
    // Navigate to your edit‐profile page, passing the username
    this.router.navigate(['/admin/edit-worker'], {
      queryParams: { username }
    });
  }
}