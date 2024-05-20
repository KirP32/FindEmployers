import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { Employe } from '../app/interfaces/user';
import { val } from 'cheerio/lib/api/attributes';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule, MatRadioModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  ChosenAge: string = '';
  ChosenEmployment: string = '';
  ChosenGender: string = '';
  area_array = <any>[];
  string: string = "https://hh.ru/search/resume?text=Angular+%D1%80%D0%B0%D0%B7%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D1%87%D0%B8%D0%BA&logic=normal&pos=full_text&exp_period=all_time&exp_company_size=any&filter_exp_period=all_time&area=1&area=92&relocation=living_or_relocation&age_from=20&age_to=50&schedule=fullDay&schedule=flexible&schedule=remote&gender=unknown&salary_from=50000&salary_to=100000&currency_code=RUR&label=only_with_salary&order_by=relevance&search_period=0&items_on_page=20&no_magic=true&hhtmFrom=resume_search_form";
  constructor(private httpClient: HttpClient) { }
  title = 'InterProga';
  value = "";
  employes_array: Employe[] = [];
  selectedValue: string = '';
  options: { id: string, name: string }[] = [];
  selectedValues: { id: string, name: string }[] = [];
  ageFrom: string = '';
  ageTo: string = '';
  ChosenExperience: string = '';
  salaryFrom: string = '';
  salaryTo: string = '';
  ngOnInit(): void {
    this.show();
  }
  show(): void {
    const params = {
      text: 'Россия',
    };
    this.get_request(params).subscribe(
      {
        next: (result) => {
          for (const element of result[0].areas) {
            for (const it of element.areas) {
              this.area_array.push({ id: it.id, name: it.name });
            }
          }
          this.options = this.area_array;
        },
        error(err) {
          alert(err);
          console.log(err);
        },
      }
    );
  }
  get_request(params: any): Observable<any> {
    return this.httpClient.get<any[]>(environment.apiHH + 'areas');
  }
  onInputChange(event: any): void {
    const inputElement = event.currentTarget as HTMLInputElement;
    const inputValue = inputElement.value;
    if (this.options.some(item => item.name === inputValue) && !this.selectedValues.some(item => item.name === inputValue)) {
      this.selectedValues.push({ name: inputValue, id: this.findID(inputValue) });
      this.selectedValue = '';
    }
  }
  deleteUlValue(value: string) {
    const index = this.selectedValues.findIndex(item => item.name === value);
    if (index !== -1) {
      this.selectedValues.splice(index, 1);
    }
  }

  findID(str: string): string {
    for (const it of this.options) {
      if (it.name === str) {
        return it.id;
      }

    }
    return '';
  }
  getEncodedUrl(string: string) {
    let stringArray = string.split(' ');
    let newStr = [];
    for (const it of stringArray) {
      if (/[а-яА-Я]/.test(it)) {
        newStr.push(encodeURIComponent(it));
      }
      else {
        newStr.push(it);
      }
    }
    return newStr.join('+');
  }

  search(): void {
    let text = this.getEncodedUrl(this.value);
    let areas = ``;
    for (const it of this.selectedValues) {
      areas += `area=${it.id}&`;
    }
    if (this.selectedValues.length === 0) {
      areas = 'area=113&'
    }
    let str = `https://hh.ru/search/resume?text=${text}&logic=normal&pos=full_text&exp_period=all_time&exp_company_size=any&filter_exp_period=all_time&${areas}relocation=living_or_relocation&age_from=${this.ageFrom}&age_to=${this.ageTo}&employment=${this.ChosenEmployment}&experience=${this.ChosenExperience}&gender=${this.ChosenGender}&label=only_with_gender&salary_from=${this.salaryFrom}&salary_to=${this.salaryTo}&currency_code=RUR&label=only_with_salary&order_by=relevance&search_period=0&items_on_page=50&no_magic=true&hhtmFrom=resume_search_form`;
    //console.log(str);
    this.get_aray(str).subscribe({
      next: (result) => {
        if (this.employes_array) {
          this.employes_array = [];
        }
        for (const it of result) {
          it.experience = it.experience.split(' ').slice(2).join(' ');
          //console.log(it.experience.split(' ').slice(2));
          //console.log(string);
          this.employes_array.push(it);
        }
        //console.log(result);
      },
      error(err) {
        console.log(err);
      },
    });
  }
  get_aray(url: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('urlHH', url);
    return this.httpClient.get<Employe[]>(environment.apiLocal + 'employes', { params: params });
  }
}
