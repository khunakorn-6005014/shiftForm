import { Component, OnInit }                 from '@angular/core';
//import { Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule,Router, ActivatedRoute }            from '@angular/router';
import { CommonModule }                      from '@angular/common';
import { FormsModule }              from '@angular/forms'

//
interface Shift {
  user: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyWage: number;
  place: string;
  slug: string;
  comments: string;
}

@Component({
  selector: 'app-add-edit-shift',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-edit-shift.component.html',
  styleUrls: ['./add-edit-shift.component.css']
})
export class AddEditShiftComponent implements OnInit {
   // Form fields
  date        = '';
  startTime   = '';
  endTime     = '';
  hourlyWage!: number;
  place       = '';
  slug        = '';
  comments    = '';

  //form!: FormGroup;
  isEditMode = false;
  originalSlug: string | null = null;
  
  showSpinner = false;
  // Error messages
  dateError  = '';
  timeError  = '';
  wageError  = '';
  placeError = '';
  slugError  = '';


  STORAGE_KEY = 'shifts';

   constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const slugParam = this.route.snapshot.queryParamMap.get('slug');
    const shifts = this.loadShifts();

    if (slugParam) {
      const shift = shifts.find(s => s.slug === slugParam);
      if (shift) {
        this.isEditMode = true;
        this.originalSlug = slugParam;
        // pre-fill fields
        this.date = shift.date;
        this.startTime = shift.startTime;
        this.endTime = shift.endTime;
        this.hourlyWage = +shift.hourlyWage;
        this.place = shift.place;
        this.slug = shift.slug;
        this.comments = shift.comments;
      }
    }
  }

  loadShifts(): any[] {
    const json = localStorage.getItem(this.STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  }

  saveShifts(arr: any[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(arr));
  }
 // real-time time validation
  validateTime(): void {
    this.timeError = '';
    if (this.startTime && this.endTime && this.endTime <= this.startTime) {
      this.timeError = 'End must be after start.';
    }
  }
  // slug uniqueness check
  validateSlug(): void {
    const shifts = this.loadShifts();
    const trimmed = this.slug.trim();
    const clash = shifts.some(s => s.slug === trimmed && trimmed !== this.originalSlug);
    this.slugError = trimmed ? (clash ? 'Slug already exists. Choose another.' : '') : 'Slug is required.';
  }

  onSubmit(): void {
    this.dateError = this.date ? '' : 'Please select a date.';
    this.validateTime();
    this.wageError = !this.hourlyWage || this.hourlyWage <= 0 ? 'Hourly wage must be > 0.' : '';
    this.placeError = this.place ? '' : 'Select a workplace.';
    this.validateSlug();

    if (this.dateError || this.timeError || this.wageError || this.placeError || this.slugError) {
      return;
    }
       // build object
    const rawUser = localStorage.getItem('loggedInUser') || '';
    const user = rawUser ? JSON.parse(rawUser) : { username: 'unknown' };


    const shift = {
      user: user.username,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      hourlyWage: this.hourlyWage,
      place: this.place,
      slug: this.slug.trim(),
      comments: this.comments.trim()
    };

    this.showSpinner = true;

    setTimeout(() => {
      let shifts = this.loadShifts();
      if (this.isEditMode) {
        shifts = shifts.map(s => s.slug === this.originalSlug ? shift : s);
      } else {
        shifts.push(shift);
      }
      this.saveShifts(shifts);
      this.showSpinner = false;
      this.router.navigate(['/home']);
    }, 500);
  }

  cancel(): void {
    this.router.navigate(['/home']);
  }
}

  