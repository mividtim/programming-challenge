
export class Position {
  public row:number
  public col:number
  public constructor(row, col) {
    this.row = row
    this.col = col
  }
}

export type Layout = number[][]

export const enum Direction {
  Up = 0,
  Right,
  Down,
  Left
}

export const enum SimulationState {
  Running,
  Circular,
  Noncircular
}
