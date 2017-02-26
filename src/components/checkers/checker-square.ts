import * as PIXI from 'pixi.js'
import {BoardPosition} from './board-layout'

export class CheckerSquare extends PIXI.Graphics {

  public boardPosition:BoardPosition
  private pixelSize:number
  private even:boolean
  private oddColor:number
  private evenColor:number

  public constructor(
    boardPosition:BoardPosition,
    pixelSize:number,
    even:boolean,
    oddColor:number = 0x111111,
    evenColor:number = 0xee1111,
    lines:boolean = false
  ) {
    super() //lines)
    this.boardPosition = boardPosition
    this.pixelSize = pixelSize
    this.even = even
    this.oddColor = oddColor
    this.evenColor = evenColor
    this.redraw()
  }

  public reset(pixelSize:number, even:boolean):void {
    // If the pixel size or color of the square changes, recreate the square
    if(this.pixelSize !== pixelSize || this.even !== even) {
      this.pixelSize = pixelSize
      this.even = even
      // Redraw the square and arrow at the proper size and position
      this.redraw()
    }
  }

  // We keep track of even/odd in an instance variable to see if we need to
  // recreate the square; I'd prefer to pass it, but hey we already have it
  private redraw():void {
    this.clear()
    this.beginFill(this.even ? this.evenColor : this.oddColor)
    // Center it on the its position
    this.drawRect(
      -this.pixelSize / 2,
      -this.pixelSize / 2,
      this.pixelSize,
      this.pixelSize
    )
    this.endFill()
  }

}
