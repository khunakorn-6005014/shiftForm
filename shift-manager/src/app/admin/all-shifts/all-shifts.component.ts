import { Component, OnInit }       from '@angular/core';
import { CommonModule }             from '@angular/common';
import { FormsModule }              from '@angular/forms';
import { Router, RouterModule }     from '@angular/router';

interface Shift {
  user: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyWage: number;
  place: string;
  slug: string;
  comments?: string;
}

@Component({
  selector: 'app-all-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './all-shifts.component.html',
  styleUrls: ['./all-shifts.component.scss']
})
export class AllShiftsComponent implements OnInit {
  shifts: Shift[] = [];
  filteredShifts: Shift[] = [];

  // Developer A’s filter object
  filters = {
    name: '',
    place: '',
    from: '',
    to: ''
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadShifts();
    this.applyFilters();
  }

  private loadShifts() {
    const json = localStorage.getItem('shifts');
    this.shifts = json ? JSON.parse(json) : [];
    this.filteredShifts = [...this.shifts];
  }

  applyFilters() {
    let arr = [...this.shifts];

    // Filter by worker name
    if (this.filters.name.trim()) {
      const n = this.filters.name.trim().toLowerCase();
      arr = arr.filter(s => s.user.toLowerCase().includes(n));
    }

    // Filter by place
    if (this.filters.place.trim()) {
      const p = this.filters.place.trim().toLowerCase();
      arr = arr.filter(s => s.place.toLowerCase().includes(p));
    }

    // Date range
    if (this.filters.from) {
      arr = arr.filter(s => s.date >= this.filters.from);
    }
    if (this.filters.to) {
      arr = arr.filter(s => s.date <= this.filters.to);
    }

    this.filteredShifts = arr;
  }

  clearFilters() {
    this.filters = { name: '', place: '', from: '', to: '' };
    this.applyFilters();
  }

  // Profit calc (public so template can call it)
  calcProfit(s: Shift): number {
    const [h1,m1] = s.startTime.split(':').map(Number);
    const [h2,m2] = s.endTime.split(':').map(Number);
    let diff = (h2 + m2/60) - (h1 + m1/60);
    if (diff < 0) diff += 24;
    return diff * s.hourlyWage;
  }

  onRowClick(s: Shift) {
    this.router.navigate(['/admin/shiftFormAd'], { queryParams: { slug: s.slug } });
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

}