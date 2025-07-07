import { Component, OnInit }                 from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute }            from '@angular/router';
import { CommonModule }                      from '@angular/common';
import { ReactiveFormsModule }               from '@angular/forms';

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-shift.component.html',
  styleUrls: ['./add-edit-shift.component.scss']
})
export class AddEditShiftComponent implements OnInit {
  get date()        { return this.form.get('date'); }
get startTime()   { return this.form.get('startTime'); }
get endTime()     { return this.form.get('endTime'); }
get hourlyWage()  { return this.form.get('hourlyWage'); }
get place()       { return this.form.get('place'); }
get slug()        { return this.form.get('slug'); }
get comments()    { return this.form.get('comments'); }

  form!: FormGroup;
  isEditMode = false;
  originalSlug: string | null = null;
  spinnerVisible = false;

  pageTitle = 'Add Shift';
  saveBtnText = 'Save Shift';

  private STORAGE_KEY = 'shifts';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.buildForm();
    const slug = this.route.snapshot.queryParamMap.get('slug');
    if (slug) {
      this.enterEditMode(slug);
    }
  }

  private buildForm() {
    this.form = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      hourlyWage: [null, [Validators.required, Validators.min(0.01)]],
      place: ['', Validators.required],
      slug: ['', {
        validators: [Validators.required],
        asyncValidators: [this.slugUniqueValidator.bind(this)],
        updateOn: 'blur'
      }],
      comments: ['']
    }, {
      validators: [this.timeOrderValidator]
    });
  }

  private enterEditMode(slug: string) {
    const shifts = this.loadShifts();
    const shift = shifts.find(s => s.slug === slug);
    if (!shift) return;
    this.isEditMode = true;
    this.originalSlug = slug;
    this.pageTitle  = 'Edit Shift';
    this.saveBtnText = 'Update Shift';
    this.form.patchValue(shift);
  }

  onCancel() {
    this.router.navigate(['/']);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const shift: Shift = {
      user: localStorage.getItem('loggedInUser') || 'unknown',
      ...this.form.value
    };

    this.spinnerVisible = true;
    setTimeout(() => {
      let shifts = this.loadShifts();
      if (this.isEditMode && this.originalSlug) {
        shifts = shifts.map(s => s.slug === this.originalSlug ? shift : s);
      } else {
        shifts.push(shift);
      }
      this.saveShifts(shifts);
      this.spinnerVisible = false;
      this.router.navigate(['/']);
    }, 500);
  }

  // -------------- Helpers --------------

  private loadShifts(): Shift[] {
    const json = localStorage.getItem(this.STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  }

  private saveShifts(arr: Shift[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(arr));
  }

  private timeOrderValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startTime')?.value;
    const end   = group.get('endTime')?.value;
    if (start && end && end <= start) {
      return { timeOrder: 'End must be after Start' };
    }
    return null;
  }

  private slugUniqueValidator(control: AbstractControl) {
    return new Promise<ValidationErrors | null>(resolve => {
      const val = control.value as string;
      const shifts = this.loadShifts();
      const clash = shifts.some(s =>
        s.slug === val && val !== this.originalSlug
      );
      resolve(clash ? { slugTaken: true } : null);
    });
  }
}
