import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [BrowserModule, FormsModule, AppComponent], // Import the standalone component here
  bootstrap: [AppComponent], // Bootstrap the standalone component
})
export class AppModule {}
