import initSqlJs, { type Database } from 'sql.js';

import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

export type Civ6MapPlot = {
  ID: number;
  TerrainType: string;
};

export class Civ6Map {
  private db: Database;

  private constructor(database: Database) {
    this.db = database;
  }

  static async fromFile(mapFileData: Uint8Array) {
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

  getSize() {
    const results = this.getResultAsObject('SELECT * FROM Map');

    const result = {
      height: results?.Height as number,
      width: results?.Width as number,
    };

    return result;
  }
}
