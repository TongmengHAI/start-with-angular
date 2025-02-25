import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { LocationService } from '../location.service';
@Component({
  selector: 'app-province',
  imports: [SharedModule],
  templateUrl: './province.component.html',
  styleUrl: './province.component.scss'
})
export class ProvinceComponent implements OnInit{
  constructor (
    private LocationService : LocationService
  ) { }

  public provinces: any[] = [];

  ngOnInit() {
    this.LocationService.getProvinces().subscribe((res) => {
      this.provinces = res;
    });
  }

}
