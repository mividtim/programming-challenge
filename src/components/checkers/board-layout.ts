import {Direction} from '../ui/arrow'

export type BoardLayout = Direction[][]

export class BoardPosition {
  public row:number
  public col:number
  public constructor(row:number, col:number) {
    this.row = row
    this.col = col
  }
}
