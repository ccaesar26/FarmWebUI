import { Component, HostListener, OnInit } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { NgForOf, NgIf } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Ripple } from 'primeng/ripple';
import { InputText } from 'primeng/inputtext';
import { mapDrawUtils, updatePolygonLabels } from './map-draw-utils';
import { Tooltip } from 'primeng/tooltip';
import { Polygon } from '../../models/polygon.model';
import { OnChangeFn, OnTouch } from '../../models/control-value-accessor';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-polygon',
  standalone: true,
  imports: [ NgIf, FormsModule, Button, Dialog, TableModule, NgForOf, ButtonDirective, Ripple, InputText, Tooltip ],
  templateUrl: './polygon.component.html',
  styleUrls: [ './polygon.component.css' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: PolygonComponent,
    }
  ]
})
export class PolygonComponent implements OnInit, ControlValueAccessor {
  polygons: Array<Polygon> = [];

  onChange: OnChangeFn<Array<Polygon>> = () => {
  };
  onTouch: OnTouch = () => {
  };

  map!: mapboxgl.Map;
  draw!: MapboxDraw;
  dialogVisible: boolean = false;

  _originalName: string = '';

  constructor(private configService: ConfigService) {
  }

  ngOnInit() {
    this.configService.retrieveMapboxToken().subscribe((token) => {
      mapboxgl.accessToken = token;

      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [ 25.60, 45.66 ],
        zoom: 11
      });

      this.draw = new MapboxDraw({
        displayControlsDefault: false,
        defaultMode: 'draw_polygon',
        styles: mapDrawUtils
      });

      this.map.addControl(this.draw);

      // Listen for draw events
      this.map.on('draw.create', (event) => this.handleDrawEvent(event));
      this.map.on('draw.update', (event) => this.handleDrawEvent(event));
      this.map.on('draw.delete', (event) => this.handleDeleteEvent(event));
      this.map.on('load', () => {
        if (this.polygons.length > 0) {
          this.restorePolygonsOnMap();
        }
      });


    });
  }

  private restorePolygonsOnMap() {
    this.polygons.forEach(polygon => {
      this.draw.add({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [ polygon.coordinates ]
        }
      });
    });
    setTimeout(() => {
      updatePolygonLabels(this.map, this.polygons);
    }, 500); // Small delay to ensure polygons are drawn before updating labels
  }


  private handleDrawEvent(event: any) {
    const features = event.features;
    if (!features || features.length === 0) return;

    features.forEach((feature: any) => {
      if (feature.geometry.type === 'Polygon') {
        const id: string = feature.id; // MapboxDraw assigns an auto-generated id
        const coordinates = feature.geometry.coordinates[0]; // Outer ring of the polygon

        // Check if polygon already exists (update case)
        const existingPolygon = this.polygons.find(p => p.id === id);
        if (existingPolygon) {
          existingPolygon.coordinates = coordinates;
        } else {
          // Add new polygon
          this.polygons.push({
            id: id,
            name: 'Field_' + id.slice(0, 6),
            coordinates: coordinates
          });
        }
      }
    });

    updatePolygonLabels(this.map, this.polygons);
    this.onChange(this.polygons); // Emit changes
  }


  private handleDeleteEvent(event: any) {
    // Remove deleted polygons from the list
    this.polygons = this.polygons.filter(polygon =>
      !event.features.some((feature: any) => feature.id === polygon.id)
    );

    updatePolygonLabels(this.map, this.polygons);
    this.onChange(this.polygons);
  }

  showDialog() {
    this.dialogVisible = true;
  }

  onRowEditSave() {
    updatePolygonLabels(this.map, this.polygons);
    this.onChange(this.polygons);
  }

  onRowEditCancel(polygon: Polygon) {
    polygon.name = this._originalName;
    this.onChange(this.polygons);
  }

  onRowEditInit(polygon: Polygon) {
    this._originalName = polygon.name;
  }

  startDrawingPolygon() {
    this.draw.changeMode('draw_polygon');
  }

  trashDrawing() {
    this.draw.trash();
  }

  // ControlValueAccessor methods

  registerOnChange(fn: OnChangeFn<Array<Polygon>>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  writeValue(value: Array<Polygon>): void {
    if (value === null) return;
    this.polygons = value;
    updatePolygonLabels(this.map, this.polygons);
  }

  @HostListener("focusout")
  onFocusOut() {
    this.onTouch();
  }
}
