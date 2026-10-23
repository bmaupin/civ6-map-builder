import { Input, Label, Surface, TextField } from '@heroui/react';
import { useState } from 'react';
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

// type ClimateZonesResponse = {
//   features?: Array<{
//     attributes: {
//       ECO_NAME: string;
//       BIOME_NAME: string;
//     };
//   }>;
//   error?: {
//     code: number;
//     message: string;
//     details?: string[];
//   };
// };

// // async function getBiomes(latitudeStart: number, longitudeStart: number, latitudeStop: number, longitudeStop: number) {
// function getBiomes() {
//   const latitudeStart = 32.288821;
//   const latitudeStop = 52.925276;
//   // TODO: dynamic longitude
//   const longitudeStart = 29.192718;
//   const longitudeStop = 37.886469;

//   const mapWidth = 36;
//   const mapHeight = 24;

//   const latitudeDifference = latitudeStop - latitudeStart;
//   const tileLatitude = latitudeDifference / mapWidth;

//   const longitudeCentre = (longitudeStop - longitudeStart) / 2 + longitudeStart;
//   console.log('longitudeCentre=', longitudeCentre);
//   const workingLongitudeStart =
//     longitudeCentre - (tileLatitude * mapHeight) / 2;
//   console.log('workingLongitudeStart=', workingLongitudeStart);
//   // TODO: do we need this?
//   const workingLongitudeStop = longitudeCentre + (tileLatitude * mapHeight) / 2;

//   // TODO: do first row
//   const mapY = 0;
//   for (let mapX = 0; mapX < mapWidth; mapX++) {
//     const latitude = mapX * tileLatitude + latitudeStart + tileLatitude / 2;
//     const longitude =
//       mapY * tileLatitude + workingLongitudeStart + tileLatitude / 2;

//     console.log('latitude=', latitude, 'longitude=', longitude);
//   }

//   return {
//     minX: latitudeStart,
//     minY: workingLongitudeStart,
//     maxX: latitudeStop,
//     maxY: workingLongitudeStop,
//   };
// }

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

export default function BiomeTest() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLookup() {
    setLoading(true);
    setOutput('');

    try {
      const map = new AppMap({
        dimensions: { height: 24, width: 36 },
        bounds: {
          // north: 52.925276,
          // south: 32.288821,
          // west: 29.192718,
          // east: 37.886469,

          north: 45,
          south: 44,
          west: 33,
          east: 34,
        },
      });

      const result = await getClimateZones(map.getNormalisedBounds());

      if (result.features.length > 0) {
        setOutput(JSON.stringify(getClimateAt(result, 33.5, 44.5)));
      } else {
        setOutput('No climate data found at this location');
      }

      // setOutput(
      //   result.features.length > 0
      //     ? JSON.stringify(result, null, 2)
      //     : 'No ecoregion found at this location.',
      // );
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
        <button onClick={handleLookup} disabled={loading}>
          {loading ? 'Loading…' : 'Look up biome'}
        </button>
        <pre role="status">{output}</pre>
      </div>
    </main>
  );
}
