import { Button, Input, Label, Surface, TextField } from '@heroui/react';
import { useRef, useState } from 'react';
import { AppMap, type GeographicBounds } from '~/utils/appmap';

const endpoint =
  'https://services.arcgis.com/BG6nSlhZSAWtExvp/ArcGIS/rest/services/WorldClimateZonesSimp/FeatureServer/0/query';

import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

interface ClimateZoneProperties {
  CLIMATE: string;
}

interface ClimateZonesResponse extends FeatureCollection<
  Polygon | MultiPolygon,
  ClimateZoneProperties
> {
  exceededTransferLimit?: boolean;
}

interface ArcGisErrorResponse {
  error: {
    code: number;
    message: string;
    details?: string[];
  };
}

type ClimateZonesApiResponse = ClimateZonesResponse | ArcGisErrorResponse;

async function getClimateZones({ west, south, east, north }: GeographicBounds) {
  const params = new URLSearchParams({
    f: 'geojson',
    geometry: JSON.stringify({
      xmin: west,
      ymin: south,
      xmax: east,
      ymax: north,
    }),
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    outSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'CLIMATE',
    returnGeometry: 'true',
  });

  const response = await fetch(`${endpoint}?${params}`);

  if (!response.ok) {
    throw new Error(`Request failed: HTTP ${response.status}`);
  }

  const data: ClimateZonesApiResponse = await response.json();

  if ('error' in data) {
    throw new Error(`ArcGIS ${data.error.code}: ${data.error.message}`);
  }

  if (data.exceededTransferLimit) {
    throw new Error('Climate query is incomplete; pagination is required.');
  }

  // ArcGIS can report an API error with an HTTP 200 response.
  // if (data.error) {
  //   throw new Error(`ArcGIS ${data.error.code}: ${data.error.message}`);
  // }

  // if (!Array.isArray(data.features)) {
  //   throw new Error('Unexpected response: missing features array');
  // }

  // return data.features.map((feature) => feature.attributes);

  return data;
}

function getClimateAt(
  regions: ClimateZonesResponse,
  longitude: number,
  latitude: number,
): string | null {
  for (const region of regions.features) {
    if (booleanPointInPolygon([longitude, latitude], region)) {
      return region.properties.CLIMATE;
    }
  }

  return null;
}

const climate2color = {
  // TERRAIN_COAST: '#16396c',
  // Desert
  Arid: '#b18e35',
  // Plains
  'Semi-arid': '#90aa6e',
  // Grassland
  Mediterranean: '#2b3317',
};

interface MapPlot {
  x: number;
  y: number;
  climate: string;
}

function drawMap(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  plots: MapPlot[],
) {
  const tileSize = 8;

  canvas.width = width * tileSize;
  canvas.height = height * tileSize;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D is unavailable');
  }

  for (const plot of plots) {
    const x = plot.x;
    const y = plot.y;

    if (plot.climate) {
      context.fillStyle = climate2color[plot.climate];
    } else {
      context.fillStyle = 'DarkBlue';
    }
    context.fillRect(
      x * tileSize,
      (height - 1 - y) * tileSize,
      tileSize,
      tileSize,
    );
  }
}

export default function BiomeTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLookup() {
    setLoading(true);
    setOutput('');

    try {
      const map = new AppMap({
        dimensions: { height: 24, width: 36 },
        bounds: {
          north: 52.925276,
          south: 32.288821,
          west: 29.192718,
          east: 37.886469,
        },
      });

      const result = await getClimateZones(map.bounds);

      if (result.features.length > 0) {
        const plots = [];
        for (let mapY = 0; mapY < map.dimensions.height; mapY++) {
          const row = [];
          for (let mapX = 0; mapX < map.dimensions.width; mapX++) {
            const tileCoordinates = map.getTileCentreCoordinates({
              x: mapX,
              y: mapY,
            });
            plots.push({
              x: mapX,
              y: mapY,
              climate: getClimateAt(
                result,
                tileCoordinates.latitudeY,
                tileCoordinates.longitudeX,
              ),
            });
          }
        }

        const canvas = canvasRef.current;
        canvas &&
          drawMap(canvas, map.dimensions.width, map.dimensions.height, plots);
      } else {
        setOutput('No climate data found at this location');
      }
    } catch (error) {
      setOutput(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      {/* <Surface
        className="flex min-w-[320px] flex-col gap-3 rounded-3xl p-6"
        variant="default"
      >
        <h3>Top left coordinate</h3>
        <TextField
          className="w-full max-w-64"
          name="latitude-start"
          type="latitude-start"
        >
          <Label>Latitude</Label>
          <Input />
        </TextField>
        <TextField
          className="w-full max-w-64"
          name="longitude-start"
          type="longitude-start"
        >
          <Label>Longitude</Label>
          <Input />
        </TextField>
      </Surface>
      <Surface
        className="flex min-w-[320px] flex-col gap-3 rounded-3xl p-6"
        variant="default"
      >
        <h3>Bottom right coordinate</h3>
        <TextField
          className="w-full max-w-64"
          name="latitude-end"
          type="latitude-end"
        >
          <Label>Latitude</Label>
          <Input />
        </TextField>
        <TextField
          className="w-full max-w-64"
          name="longitude-end"
          type="longitude-end"
        >
          <Label>Longitude</Label>
          <Input />
        </TextField>
      </Surface> */}
      <div>
        <Button onClick={handleLookup} disabled={loading}>
          {loading ? 'Loading…' : 'Generate map'}
        </Button>
        <pre role="status">{output}</pre>
        <canvas
          id="map-preview"
          ref={canvasRef}
          aria-label="Map terrain preview"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </main>
  );
}
