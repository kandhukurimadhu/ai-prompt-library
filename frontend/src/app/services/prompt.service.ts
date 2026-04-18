import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Prompt {
  id: number;
  title: string;
  content: string;
  complexity: number;
  created_at: string;
  view_count?: number;
}

export interface CreatePromptPayload {
  title: string;
  content: string;
  complexity: number;
}

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  private apiBase = '/prompts';

  constructor(private http: HttpClient) {}

  getPrompts(): Observable<Prompt[]> {
    return this.http.get<Prompt[]>(`${this.apiBase}/`);
  }

  getPrompt(id: number): Observable<Prompt> {
    return this.http.get<Prompt>(`${this.apiBase}/${id}/`);
  }

  createPrompt(data: CreatePromptPayload): Observable<Prompt> {
    return this.http.post<Prompt>(`${this.apiBase}/`, data);
  }
}
