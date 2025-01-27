import {Component, OnInit} from '@angular/core';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import {DecimalPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {Card} from 'primeng/card';
import {Panel} from 'primeng/panel';
import {Listbox} from 'primeng/listbox';
import {FormsModule} from '@angular/forms';
import {PrimeTemplate} from 'primeng/api';
import {Scroller} from 'primeng/scroller';
import {Button} from 'primeng/button';
import {AuraPreset} from '../theme';

@Component({
  selector: 'app-polygon',
  standalone: true,
  imports: [NgIf, DecimalPipe, NgForOf, Card, Panel, Listbox, FormsModule, PrimeTemplate, Scroller, NgClass, Button],
  templateUrl: './polygon.component.html',
  styleUrls: ['./polygon.component.css']
})
export class PolygonComponent implements OnInit {
  map!: mapboxgl.Map;
  draw!: MapboxDraw;
  coordinates: number[][] | null = null;
  dummyCoordinates = [
    [-91.874, 42.76],
    [-91.874, 42.77],
    [-91.864, 42.77],
    [-91.864, 42.76],
    [-91.874, 42.76]
  ];
  dialogVisible: boolean = false;

  ngOnInit() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2NhZXNhciIsImEiOiJjbHFxbDJxY280MjJuMm5tazZwYWZ6cjBhIn0.Si8HxzoWgI0n5VF5_FqyFQ';
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [25.60, 45.66],
      zoom: 11
    });

    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'draw_polygon',
      styles: [
        // ACTIVE (being drawn)
        // line stroke
        {
          "id": "gl-draw-line",
          "type": "line",
          "filter": ["all", ["==", "$type", "LineString"]],
          "layout": {
            "line-cap": "round",
            "line-join": "round"
          },
          "paint": {
            "line-color": AuraPreset.semantic.primary[500],
            "line-dasharray": [0.2, 2],
            "line-width": 2
          }
        },
        // polygon fill
        {
          "id": "gl-draw-polygon-fill",
          "type": "fill",
          "filter": ["all", ["==", "$type", "Polygon"]],
          "paint": {
            "fill-color": AuraPreset.semantic.primary[500],
            "fill-outline-color": AuraPreset.semantic.primary[500],
            "fill-opacity": 0.1
          }
        },
        // polygon mid points
        {
          'id': 'gl-draw-polygon-midpoint',
          'type': 'circle',
          'filter': ['all',
            ['==', '$type', 'Point'],
            ['==', 'meta', 'midpoint']],
          'paint': {
            'circle-radius': 3,
            'circle-color': AuraPreset.semantic.primary[500],
          }
        },
        // polygon outline stroke
        // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
        {
          "id": "gl-draw-polygon-stroke-active",
          "type": "line",
          "filter": ["all", ["==", "$type", "Polygon"]],
          "layout": {
            "line-cap": "round",
            "line-join": "round"
          },
          "paint": {
            "line-color": AuraPreset.semantic.primary[500],
            "line-dasharray": [0.2, 2],
            "line-width": 2
          }
        },
        // vertex point halos
        {
          "id": "gl-draw-polygon-and-line-vertex-halo-active",
          "type": "circle",
          "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
          "paint": {
            "circle-radius": 5,
            "circle-color": "#FFF"
          }
        },
        // vertex points
        {
          "id": "gl-draw-polygon-and-line-vertex-active",
          "type": "circle",
          "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
          "paint": {
            "circle-radius": 3,
            "circle-color": AuraPreset.semantic.primary[500],
          }
        }
      ]
    });

    this.map.addControl(this.draw);
  }

  showDialog() {
    this.dialogVisible = true;
  }
}
