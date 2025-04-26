import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Ripple } from 'primeng/ripple';
import { InputText } from 'primeng/inputtext';
import { getPolygonCentroid, mapDrawUtils, updatePolygonLabels } from './map-draw-utils';
import { Tooltip } from 'primeng/tooltip';
import { Polygon } from '../../models/polygon.model';
import { OnChangeFn, OnTouch } from '../../models/control-value-accessor';
import { ConfigService } from '../../services/config.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { MapboxGeocoderService } from '../../services/mapbox-geocoder.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { Listbox } from 'primeng/listbox';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-polygon',
  standalone: true,
  imports: [ NgIf, FormsModule, Button, Dialog, TableModule, NgForOf, ButtonDirective, Ripple, InputText, Tooltip, NgClass, IconField, InputIcon, Listbox, Card ],
  templateUrl: './polygon.component.html',
  styleUrls: [ './polygon.component.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: PolygonComponent,
    }
  ]
})
export class PolygonComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() mapWidth: string = 'w-full'; // Default width, can be overridden
  @Input() mapHeight: string = 'h-80'; // Default height, can be overridden

  @Input() polygons: Array<Polygon> = [];

  searchQuery: string = '';
  searchResults: any[] = [];
  selectedSearchResult: any | null = null;
  private searchTerms = new Subject<string>();

  onChange: OnChangeFn<Array<Polygon>> = () => {
  };
  onTouch: OnTouch = () => {
  };

  map!: mapboxgl.Map;
  draw!: MapboxDraw;
  dialogVisible: boolean = false;

  _originalName: string = '';

  constructor(
    private configService: ConfigService,
    private mapboxGeocoderService: MapboxGeocoderService
  ) {
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

        this.searchTerms.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((term: string) => this.mapboxGeocoderService.searchLocation(term))
        ).subscribe(results => {
          this.searchResults = results.features || [];
        });
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void { // Implement ngOnChanges
    if (changes['polygons'] && !changes['polygons'].firstChange) { // Check if 'polygons' input changed and it's not the first change
      // React to changes in the polygons input (e.g., when loaded initially or updated)
      if (this.map && this.map.loaded()) {
        this.restorePolygonsOnMap(); // Re-render polygons on the map
      } else if (this.map) {
        this.map.on('load', () => this.restorePolygonsOnMap()); // If map not loaded yet, wait for load
      }
    }
  }

  private restorePolygonsOnMap() {
    if (this.draw) {
      this.draw.deleteAll(); // Clear existing features from Mapbox Draw
    }

    if (this.polygons && this.polygons.length > 0) {
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
    } else {
      updatePolygonLabels(this.map, []); // Clear labels if no polygons
    }
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
    if (value) {
      // For form control updates *after* initial load. No need to re-render map here.
      this.polygons = value; // Update internal polygons. ngOnChanges will handle map rendering on initial load.
    } else {
      this.polygons = []; // Handle null/undefined values if needed.
    }
  }

  @HostListener("focusout")
  onFocusOut() {
    this.onTouch();
  }

  zoomIn() {
    if (this.map) {
      this.map.zoomIn();
    }
  }

  zoomOut() {
    if (this.map) {
      this.map.zoomOut();
    }
  }

  onSearch(): void {
    this.searchTerms.next(this.searchQuery);
  }

  onSelectSearchResult(result: any): void {
    if (this.map && result && result.properties.coordinates) {
      const longitude = result.properties.coordinates.longitude;
      const latitude = result.properties.coordinates.latitude;

      this.map.flyTo({
        center: [ longitude, latitude ],
        zoom: 13, // Adjust zoom level as needed
        speed: 1.2,
        curve: 1
      });
      this.searchResults = []; // Clear search results
      this.searchQuery = '';    // Clear search input
      this.selectedSearchResult = null;
    }
  }

  onFieldSelect(event: any) { // Add onFieldSelect method
    alert('Field selected: ' + event.data.name); // Show alert with selected field name
    const selectedPolygon: Polygon = event.data; // Extract selected polygon from event.data

    if (selectedPolygon && selectedPolygon.coordinates && selectedPolygon.coordinates.length > 0) {
      const centerLngLat = getPolygonCentroid(selectedPolygon.coordinates); // Get polygon center

      if (centerLngLat) {
        this.dialogVisible = false; // Hide the dialog
        this.map.flyTo({
          center: centerLngLat, // Fly to the center of the selected polygon
          zoom: 14, // Adjust zoom level as needed
          speed: 1.2,
          curve: 1
        });
      }
    }
  }

  onGoToFieldButtonClick(selectedPolygon: Polygon) {
    if (selectedPolygon && selectedPolygon.coordinates && selectedPolygon.coordinates.length > 0) {
      const centerLngLat = getPolygonCentroid(selectedPolygon.coordinates); // Get polygon center

      if (centerLngLat) {
        this.dialogVisible = false; // Hide the dialog
        this.map.flyTo({
          center: centerLngLat, // Fly to the center of the selected polygon
          zoom: 14, // Adjust zoom level as needed
          speed: 1.2,
          curve: 1
        });
      }
    }
  }
}
