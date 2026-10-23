interface MapDimensions {
  height: number;
  width: number;
}

export interface GeographicBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

interface AppMapProperties {
  dimensions: MapDimensions;
  bounds: GeographicBounds;
}

// Intermediate representation of the map used by the app which will be used to
// generate a Civ6Map file
export class AppMap {
  readonly dimensions: Readonly<MapDimensions>;
  readonly requestedBounds: Readonly<GeographicBounds>;

  constructor({ dimensions, bounds }: AppMapProperties) {
    this.dimensions = dimensions;
    this.requestedBounds = bounds;
  }

  getNormalisedBounds(): GeographicBounds {
    // TODO
    // south = 32.288821;
    // north = 52.925276;
    // TODO: dynamic longitude
    // const west = 29.192718;
    // const east = 37.886469;

    // const mapWidth = 36;
    // const mapHeight = 24;

    // TODO: this normalises north/south; we should also be able to handle east/west normalisation
    const latitudeDifference =
      this.requestedBounds.north - this.requestedBounds.south;
    const tileLatitude = latitudeDifference / this.dimensions.width;

    const longitudeCentre =
      (this.requestedBounds.east - this.requestedBounds.west) / 2 +
      this.requestedBounds.west;
    console.log('longitudeCentre=', longitudeCentre);
    const normalisedWest =
      longitudeCentre - (tileLatitude * this.dimensions.height) / 2;
    console.log('normalisedWest=', normalisedWest);
    // TODO: do we need this?
    const normalisedEast =
      longitudeCentre + (tileLatitude * this.dimensions.height) / 2;

    // // TODO: do first row
    // const mapY = 0;
    // for (let mapX = 0; mapX < this.dimensions.width; mapX++) {
    //   const latitude =
    //     mapX * tileLatitude + this.requestedBounds.south + tileLatitude / 2;
    //   const longitude =
    //     mapY * tileLatitude + normalisedWest + tileLatitude / 2;

    //   console.log('latitude=', latitude, 'longitude=', longitude);
    // }

    return {
      south: this.requestedBounds.south,
      west: normalisedWest,
      north: this.requestedBounds.north,
      east: normalisedEast,
    };
  }
}
