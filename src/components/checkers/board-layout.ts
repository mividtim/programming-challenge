
export const enum Direction {
  Up = 0,
  Right,
  Down,
  Left
}

export type BoardLayout = Direction[][]

export class BoardPosition {
  public row:number
  public col:number
  public constructor(row:number, col:number) {
    this.row = row
    this.col = col
  }
}
