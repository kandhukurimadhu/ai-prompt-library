import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PromptService } from '../../services/prompt.service';

@Component({
  selector: 'app-add-prompt',
  templateUrl: './add-prompt.component.html'
})
export class AddPromptComponent implements OnInit {
  promptForm!: FormGroup;
  submitting = false;
  submitError = '';
  submitSuccess = false;

  constructor(
    private fb: FormBuilder,
    private promptService: PromptService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.promptForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      complexity: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }

  get title() { return this.promptForm.get('title')!; }
  get content() { return this.promptForm.get('content')!; }
  get complexity() { return this.promptForm.get('complexity')!; }

  get complexityValue(): number {
    const v = Number(this.complexity.value);
    return isNaN(v) ? 1 : Math.min(10, Math.max(1, v));
  }

  get complexityFillPercent(): string {
    return ((this.complexityValue - 1) / 9 * 100) + '%';
  }

  get complexityFillColor(): string {
    const v = this.complexityValue;
    if (v <= 3) return '#4af7a0';
    if (v <= 6) return '#f7c948';
    return '#f74a6a';
  }

  onSubmit(): void {
    if (this.promptForm.invalid) {
      this.promptForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.submitError = '';

    this.promptService.createPrompt({
      title: this.title.value.trim(),
      content: this.content.value.trim(),
      complexity: this.complexityValue
    }).subscribe({
      next: (created) => {
        this.submitting = false;
        this.submitSuccess = true;
        setTimeout(() => this.router.navigate(['/prompts', created.id]), 800);
      },
      error: (err) => {
        this.submitting = false;
        const errors = err?.error?.errors;
        if (errors) {
          this.submitError = Object.values(errors).join(' ');
        } else {
          this.submitError = 'Something went wrong. Please try again.';
        }
      }
    });
  }
}
