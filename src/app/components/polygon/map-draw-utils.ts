import {AuraPreset} from '../../theme';
import mapboxgl from 'mapbox-gl';
import {Polygon} from '../../types/polygon';

export function updatePolygonLabels(map: mapboxgl.Map, polygons: Array<Polygon>) {
  const labelFeatures: GeoJSON.Feature<GeoJSON.Point>[] = polygons.map(polygon => ({
    type: "Feature",
    properties: {name: polygon.name},
    geometry: {
      type: "Point",
      coordinates: getPolygonCentroid(polygon.coordinates)
    }
  }));

  if (map.getSource('polygon-labels')) {
    (map.getSource('polygon-labels') as mapboxgl.GeoJSONSource).setData({
      type: "FeatureCollection",
      features: labelFeatures
    });
  } else {
    map.addSource('polygon-labels', {
      type: 'geojson',
      data: {
        type: "FeatureCollection",
        features: labelFeatures
      }
    });

    map.addLayer({
      id: 'polygon-labels-layer',
      type: 'symbol',
      source: 'polygon-labels',
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 14,
        'text-anchor': 'center',
        'text-offset': [0, 1.2]
      },
      paint: {
        'text-color': AuraPreset.semantic.primary[900],
        'text-halo-color': AuraPreset.semantic.primary[100],
        'text-halo-width': 2,
        'text-halo-width-transition': {duration: 10}
      }
    });
  }
}

/**
 * Calculates the centroid of a polygon.
 * @param coordinates - Array of [longitude, latitude] points.
 * @returns The centroid [longitude, latitude].
 */
function getPolygonCentroid(coordinates: number[][]): [number, number] {
  let x = 0, y = 0, len = coordinates.length;
  coordinates.forEach(coord => {
    x += coord[0];
    y += coord[1];
  });
  return [x / len, y / len]; // Return the centroid as a tuple
}


export const mapDrawUtils = [
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
  {
    'id': 'gl-draw-polygon-midpoint',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    'paint': {
      'circle-radius': 3,
      'circle-color': AuraPreset.semantic.primary[500],
    }
  },
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
  {
    "id": "gl-draw-polygon-and-line-vertex-halo-active",
    "type": "circle",
    "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
    "paint": {
      "circle-radius": 5,
      "circle-color": "#FFF"
    }
  },
  {
    "id": "gl-draw-polygon-and-line-vertex-active",
    "type": "circle",
    "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
    "paint": {
      "circle-radius": 3,
      "circle-color": AuraPreset.semantic.primary[500],
    }
  }
];
