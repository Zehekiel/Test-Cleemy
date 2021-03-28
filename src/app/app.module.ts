import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

export type Config = {
  id: string
  purchasedOn: Date
  nature: string
  originalAmount: {amount: number, currency: string}
  convertedAmount:  {amount: number, currency: string}
  comment: string
  createdAt: Date
  lastModifiedAt: Date
}
