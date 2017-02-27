import {CheckerBoard} from '../checker-board'
import {DirectedCheckerSquare} from './directed-checker-square'
import {Direction, BoardLayout} from '../board-layout'

export class DirectedCheckerBoard extends CheckerBoard<DirectedCheckerSquare> {

  private boardLayout:BoardLayout

  public constructor(
    boardLayout:BoardLayout,
    pixelSize:number,
    oddColor:number = 0x111111,
    evenColor:number = 0xee1111
  ) {
    super(
      boardLayout.length,
      pixelSize,
      oddColor,
      evenColor,
      DirectedCheckerSquare
    )
    this.setBoardLayout(boardLayout)
  }

  public setBoardLayout(boardLayout:BoardLayout) {
    for(let row:number = 0 ; row < boardLayout.length ; row++) {
      for(let col:number = 0 ; col < boardLayout.length ; col++) {
        const square:DirectedCheckerSquare = this.squares[row][col]
        square.setDirection(boardLayout[row][col])
      }
    }
  }
}
