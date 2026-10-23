export interface GeographicBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

interface MapDimensions {
  height: number;
  width: number;
}

interface MapCoordinates {
  latitudeY: number;
  longitudeX: number;
}

interface TileCoordinates {
  x: number;
  y: number;
}

interface AppMapProperties {
  dimensions: MapDimensions;
  bounds: GeographicBounds;
}

// Intermediate representation of the map used by the app which will be used to
// generate a Civ6Map file
export class AppMap {
  readonly dimensions: Readonly<MapDimensions>;
  readonly bounds: Readonly<GeographicBounds>;
  // TODO: This is a hack to represent width/height of a tile in latitude
  readonly tileToLatitudeHack: Readonly<number>;

  constructor({ dimensions, bounds }: AppMapProperties) {
    this.dimensions = dimensions;
    [this.bounds, this.tileToLatitudeHack] = this.normaliseBounds(bounds);
  }

  // TODO: this only normalises north/south; we should also be able to handle east/west normalisation
  private normaliseBounds(
    requestedBounds: GeographicBounds,
  ): [GeographicBounds, number] {
    const tileLatitude =
      (requestedBounds.north - requestedBounds.south) / this.dimensions.width;

    const longitudeCentre =
      (requestedBounds.east - requestedBounds.west) / 2 + requestedBounds.west;
    const normalisedWest =
      longitudeCentre - (tileLatitude * this.dimensions.height) / 2;
    const normalisedEast =
      longitudeCentre + (tileLatitude * this.dimensions.height) / 2;

    return [
      {
        south: requestedBounds.south,
        west: normalisedWest,
        north: requestedBounds.north,
        east: normalisedEast,
      },
      tileLatitude,
    ];
  }

  getTileCentreCoordinates(tileCoordinates: TileCoordinates): MapCoordinates {
    const latitudeY =
      tileCoordinates.x * this.tileToLatitudeHack +
      this.bounds.south +
      this.tileToLatitudeHack / 2;
    const longitudeX =
      tileCoordinates.y * this.tileToLatitudeHack +
      this.bounds.west +
      this.tileToLatitudeHack / 2;

    return {
      latitudeY,
      longitudeX,
    };
  }
}
