import {Arrow} from '../../ui/arrow'
import {CheckerSquare} from '../checker-square'
import {BoardPosition, Direction} from '../board-layout'

export class DirectedCheckerSquare extends CheckerSquare {

  private arrow:Arrow

  public constructor(
    position:BoardPosition,
    pixelSize:number,
    even:boolean,
    oddColor:number = 0x111111,
    evenColor:number = 0xee1111,
    direction:Direction = Direction.Up,
    arrowColor:number = 0xffffff,
    lines:boolean = false
  ) {
    super(position, pixelSize, even, oddColor, evenColor, lines)
    this.addChild(this.arrow = new Arrow(pixelSize, direction, arrowColor))
  }

  public reset(pixelSize:number, even:boolean) {
    super.reset(pixelSize, even)
    this.arrow.redraw(pixelSize)
  }

  public setDirection(direction:Direction) {
    this.arrow.setDirection(direction)
  }
}
