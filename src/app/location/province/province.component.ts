import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { LocationService } from '../location.service';
declare var $: any; // Import jQuery globally

@Component({
  selector: 'app-province',
  imports: [SharedModule],
  templateUrl: './province.component.html',
  styleUrl: './province.component.scss',
})
export class ProvinceComponent implements OnInit {
  constructor(private LocationService: LocationService) {}

  public provinces: any[] = [];
  public districts: any[] = [];
  public communes: any[] = [];
  public villages: any[] = [];

  ngOnInit() {
    this.LocationService.getProvinces().subscribe((res) => {
      this.provinces = res;
    });
  }

  onOptionSelectProvince(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.districts = [];
    this.communes = [];
    this.villages = [];
    console.log(selectedValue);

    this.LocationService.getProvinceById(selectedValue).subscribe((res) => {
      this.districts = res.districts;
    });
  }
  onOptionSelectDistrict(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.communes = [];
    this.villages = [];

    this.LocationService.getDistrictById(selectedValue).subscribe((res) => {
      this.communes = res.communes;
    });
  }

  onOptionSelectCommune(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.LocationService.getCommuneById(selectedValue).subscribe((res) => {
      this.villages = res.villages;
    });
  }

}
