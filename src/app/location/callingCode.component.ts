import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { countries, flags, callingCodes } from './counties';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProvinceComponent } from './province/province.component';

@Component({
  selector: 'app-countries',
  imports: [SharedModule, ProvinceComponent],
  templateUrl: './callingCode.component.html',
  styleUrls: ['./callingCode.component.scss'],
})
export class CountryPickerComponent implements OnInit {
  @Input() showFlags: boolean = true;
  @Output() countryChanged = new EventEmitter<string>();

  countries: {
    name: string;
    code: string;
    flag: string;
    callingCode: string;
  }[] = [];
  flags: { [key: string]: string } = {};
  callingCodes: { [key: string]: string } = {};
  selectedCountry: any = null;
  showDropdown: boolean = false;
  filterText: string = '';
  phoneNumber: string = '';
  public a: string = '';
  public locationForm: FormGroup;

  constructor(private _formBuilder: FormBuilder) {
    this.countries = countries;
    this.flags = flags;
    this.callingCodes = callingCodes;

    this.locationForm = this._formBuilder.group({
      callingCode: ['', Validators.required],
      phoneNumber: ['', Validators.required],
    });
  }
  ngOnInit() {
    this.countries = this.countries.map((c) => ({
      ...c,
      flag: this.flags[c.flag] || '',
      callingCode: this.callingCodes[c.flag] || '',
    }));
    this.selectedCountry = this.countries.find((c) => c.code === 'kh'); // Default to Cambodia

    this.locationForm.patchValue({
      callingCode: this.selectedCountry.callingCode,
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  selectCountry(country: any) {
    this.selectedCountry = country;
    this.showDropdown = false;
    this.countryChanged.emit(country.code);
    this.locationForm.patchValue({
      callingCode: this.selectedCountry.callingCode,
    });
  }

  filterCountries() {
    return this.countries.filter((c) =>
      c.name.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  onSubmit() {
    const data = this.locationForm.value;
    console.log(data);
  }
}
