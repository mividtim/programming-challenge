import * as PIXI from 'pixi.js'
import {Direction} from '../checkers/board-layout'

export class Arrow extends PIXI.Graphics {

  private direction:Direction = Direction.Up
  private color:number

  public constructor(
    size:number,
    direction:Direction = Direction.Up,
    color=0xffffff,
    lines:boolean = false
  ) {
    super() //lines)
    this.redraw(size, color)
    this.setDirection(direction)
  }

  // Only its fill color is configurable, and no stroke
  // Arrow size is calculated relative to square size
  // Full of "magic numbers": TBD to move these to config
  public redraw(size:number, color:number = null) {
    if(color == null)
      color = this.color
    else
      this.color = color
    this.clear()
    this.beginFill(color)
    // The body of the arrow
    this.drawRect(-size / 12, -size * .2, size / 6, size * .6)
    // The arrowhead
    this.drawPolygon([
      new PIXI.Point(0, -size * .4),
      new PIXI.Point(-size * .25, -size * .1),
      new PIXI.Point(size * .25, -size * .1)
    ])
    this.endFill()
  }

  public setDirection(direction:Direction) {
    this.direction = direction
    this.rotation = Math.PI / 2 * this.direction
  }
}
