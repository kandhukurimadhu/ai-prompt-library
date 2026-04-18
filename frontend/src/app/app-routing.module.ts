import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromptListComponent } from './components/prompt-list/prompt-list.component';
import { PromptDetailComponent } from './components/prompt-detail/prompt-detail.component';
import { AddPromptComponent } from './components/add-prompt/add-prompt.component';

const routes: Routes = [
  { path: '', redirectTo: 'prompts', pathMatch: 'full' },
  { path: 'prompts', component: PromptListComponent },
  { path: 'prompts/:id', component: PromptDetailComponent },
  { path: 'add-prompt', component: AddPromptComponent },
  { path: '**', redirectTo: 'prompts' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
