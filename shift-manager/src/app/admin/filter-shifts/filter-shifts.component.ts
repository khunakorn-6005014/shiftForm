import { Component, OnInit }            from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { FormsModule }                   from '@angular/forms';
import {
  Router,
  ActivatedRoute,
  RouterModule
} from '@angular/router';

interface Shift {
  user:       string;
  date:       string;  // "YYYY-MM-DD"
  startTime:  string;  // "HH:mm"
  endTime:    string;  // "HH:mm"
  hourlyWage: number;
  place:      string;
  slug:       string;
  comments?:  string;
}

@Component({
  selector: 'app-filter-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './filter-shifts.component.html',
  styleUrls: ['./filter-shifts.component.scss']
})
export class FilterShiftsComponent implements OnInit {
  workerName = '';
  shifts: Shift[]         = [];
  filteredShifts: Shift[] = [];

  filters = {
    place: '',
    from:  '',
    to:    ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // 1) get worker username from queryParam
    const name = this.route.snapshot.queryParamMap.get('username');
    if (!name) {
      this.router.navigate(['/admin/workers']);
      return;
    }
    this.workerName = name;

    // 2) load & prefilter
    const raw = localStorage.getItem('shifts') || '[]';
    this.shifts = (JSON.parse(raw) as Shift[])
      .filter(s => s.user === this.workerName);

    // 3) initialize filtered list
    this.filteredShifts = [...this.shifts];
  }

  // calculate profit for a shift
  calcProfit(s: Shift): number {
    const [h1,m1] = s.startTime.split(':').map(Number);
    const [h2,m2] = s.endTime.split(':').map(Number);
    let diff = (h2 + m2/60) - (h1 + m1/60);
    if (diff < 0) diff += 24;
    return diff * s.hourlyWage;
  }

  // apply filters in-place
  applyFilters() {
    let arr = [...this.shifts];

    if (this.filters.place.trim()) {
      const p = this.filters.place.trim().toLowerCase();
      arr = arr.filter(s => s.place.toLowerCase().includes(p));
    }
    if (this.filters.from) {
      arr = arr.filter(s => s.date >= this.filters.from);
    }
    if (this.filters.to) {
      arr = arr.filter(s => s.date <= this.filters.to);
    }

    this.filteredShifts = arr;
  }

  clearFilters() {
    this.filters = { place: '', from: '', to: '' };
    this.applyFilters();
  }
  // go back to edit-worker
  goBack() {
    this.router.navigate(['/admin/worker'], {
      queryParams: { username: this.workerName }
    });
  }

  // admin header nav
 goToShifts() {
  this.router.navigate(['/admin/shifts']);
}

goToWorkers() {
  this.router.navigate(['/admin/workers']);
}

  logout()         { 
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('loginTimestamp');
    this.router.navigate(['/login']);
  }
}