/** Tipos y utilidades de los laberintos (tiles). */

export type TileType = '#' | '.' | 'S' | 'G' | 'O';

export type GridPoint = {
  /** Coordenada de rejilla medida desde la esquina superior izquierda. */
  x: number;
  y: number;
};

export type MazeLevel = {
  id: number;
  name: string;
  rows: readonly string[];
  columns: number;
  rowCount: number;
  start: GridPoint;
  goal: GridPoint;
};

export type LevelConfig = {
  id: number;
  name: string;
  rows: readonly string[];
};

const countTile = (rows: readonly string[], tile: string) =>
  rows.reduce((total, row) => total + [...row].filter((character) => character === tile).length, 0);

const findTile = (rows: readonly string[], tile: string, levelId: number): GridPoint => {
  const y = rows.findIndex((row) => row.includes(tile));
  if (y < 0) {
    throw new Error(`El nivel ${levelId} no contiene el marcador "${tile}"`);
  }
  return { x: rows[y].indexOf(tile), y };
};

/**
 * Convierte un mapa de texto en un nivel.
 * Valida que sea rectangular y que tenga exactamente un inicio (S) y una meta (G).
 */
export function createLevel({ id, name, rows }: LevelConfig): MazeLevel {
  if (rows.length === 0) {
    throw new Error(`El nivel ${id} no tiene filas`);
  }
  const columns = rows[0].length;
  if (rows.some((row) => row.length !== columns)) {
    throw new Error(`Todas las filas del nivel ${id} deben tener el mismo ancho`);
  }
  if (countTile(rows, 'S') !== 1) {
    throw new Error(`El nivel ${id} debe tener exactamente un inicio (S)`);
  }
  if (countTile(rows, 'G') !== 1) {
    throw new Error(`El nivel ${id} debe tener exactamente una meta (G)`);
  }

  return {
    id,
    name,
    rows,
    columns,
    rowCount: rows.length,
    start: findTile(rows, 'S', id),
    goal: findTile(rows, 'G', id),
  };
}

/** Devuelve el tile en una coordenada. Fuera del mapa cuenta como muro. */
export function getTile(level: MazeLevel, column: number, row: number): TileType {
  if (column < 0 || row < 0 || column >= level.columns || row >= level.rowCount) {
    return '#';
  }
  return level.rows[row][column] as TileType;
}
