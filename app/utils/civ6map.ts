import initSqlJs, { type Database } from 'sql.js';

import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

export type Civ6MapInfo = {
  Height: number;
  Width: number;
};

export type Civ6TerrainType =
  | 'TERRAIN_COAST'
  | 'TERRAIN_DESERT'
  | 'TERRAIN_DESERT_HILLS'
  | 'TERRAIN_DESERT_MOUNTAIN'
  | 'TERRAIN_GRASS'
  | 'TERRAIN_GRASS_HILLS'
  | 'TERRAIN_GRASS_MOUNTAIN'
  | 'TERRAIN_OCEAN'
  | 'TERRAIN_PLAINS'
  | 'TERRAIN_PLAINS_HILLS'
  | 'TERRAIN_PLAINS_MOUNTAIN'
  | 'TERRAIN_SNOW'
  | 'TERRAIN_SNOW_HILLS'
  | 'TERRAIN_SNOW_MOUNTAIN'
  | 'TERRAIN_TUNDRA'
  | 'TERRAIN_TUNDRA_HILLS'
  | 'TERRAIN_TUNDRA_MOUNTAIN';

export type Civ6MapPlot = {
  ID: number;
  TerrainType: Civ6TerrainType;
};

export class Civ6Map {
  private db: Database;

  private constructor(database: Database) {
    this.db = database;
  }

  static async fromData(mapFileData: Uint8Array) {
    const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
    const db = new SQL.Database(mapFileData);

    return new Civ6Map(db);
  }

  private getResultAsObject(query: string) {
    const statement = this.db.prepare(query);

    let result = null;

    if (statement.step()) {
      result = statement.getAsObject();
    }

    statement.free();

    return result;
  }

  private getResultAsObjectArray(query: string) {
    const statement = this.db.prepare(query);

    const results = [];
    while (statement.step()) {
      results.push(statement.getAsObject());
    }

    statement.free();

    return results;
  }

  getPlots() {
    return this.getResultAsObjectArray(`SELECT ID, TerrainType
      FROM Plots
      ORDER BY ID;`) as Civ6MapPlot[];
  }

  getInfo() {
    return this.getResultAsObject('SELECT * FROM Map') as Civ6MapInfo;
  }
}
