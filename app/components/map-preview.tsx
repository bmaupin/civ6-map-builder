import mapUrl from '../../data/Empty 36x24.Civ6Map?url';
// import mapUrl from '../../data/Sumeria.Civ6Map?url';
import { Civ6Map, type Civ6MapInfo, type Civ6MapPlot } from '~/utils/civ6map';
import { useEffect, useRef } from 'react';

const terrain2color = {
  TERRAIN_COAST: '#16396c',
  TERRAIN_DESERT: '#b18e35',
  TERRAIN_DESERT_HILLS: '#b18e35',
  TERRAIN_DESERT_MOUNTAIN: '#b18e35',
  TERRAIN_GRASS: '#2b3317',
  TERRAIN_GRASS_HILLS: '#2b3317',
  TERRAIN_GRASS_MOUNTAIN: '#2b3317',
  TERRAIN_OCEAN: '#050e24',
  TERRAIN_PLAINS: '#90aa6e',
  TERRAIN_PLAINS_HILLS: '#90aa6e',
  TERRAIN_PLAINS_MOUNTAIN: '#90aa6e',
  TERRAIN_SNOW: '#eceeee',
  TERRAIN_SNOW_HILLS: '#eceeee',
  TERRAIN_SNOW_MOUNTAIN: '#eceeee',
  TERRAIN_TUNDRA: '#a09b90',
  TERRAIN_TUNDRA_HILLS: '#a09b90',
  TERRAIN_TUNDRA_MOUNTAIN: '#a09b90',
};

function drawMap(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  plots: Civ6MapPlot[],
) {
  const tileSize = 8;

  canvas.width = width * tileSize;
  canvas.height = height * tileSize;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D is unavailable');
  }

  for (const plot of plots) {
    const x = plot.ID % width;
    const y = Math.floor(plot.ID / width);

    context.fillStyle = terrain2color[plot.TerrainType];
    context.fillRect(
      x * tileSize,
      (height - 1 - y) * tileSize,
      tileSize,
      tileSize,
    );
  }
}

type MapPreviewProps = {
  map: Civ6Map;
};

export default function MapPreview({ map }: MapPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapInfo = map.getInfo();
  const plots = map.getPlots();

  useEffect(() => {
    async function runOnce() {
      const canvas = canvasRef.current;
      if (canvas) {
        drawMap(canvas, mapInfo.Width, mapInfo.Height, plots);
      } else {
        throw new Error('canvas not ready');
      }
    }

    runOnce();
  }, []);

  return (
    <canvas
      id="map-preview"
      ref={canvasRef}
      aria-label="Map terrain preview"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}
