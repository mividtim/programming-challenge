import * as fs from 'fs'
import * as PIXI from 'pixi.js'
import {Position, Direction} from './types'
import {Visualization} from './visualization'

const config =
  JSON.parse(fs.readFileSync('./config.json', 'utf-8')).visualization

export class Square {

  public square:PIXI.Graphics
  private visualization:Visualization
  private position:Position
  private pixelSize:number
  private even:boolean
  private arrow:PIXI.Graphics

  public constructor(
    visualization:Visualization,
    position:Position,
    even:boolean,
    direction:Direction = Direction.Up
  ) {
    this.visualization = visualization
    this.pixelSize = this.visualization.squareSize
    this.position = position
    this.even = even
    // No need to keep track of direction - we can safely set rotation on every
    // reset
    this.createSquare()
    this.reset(this.even, direction)
  }

  public reset(even:boolean, direction:Direction):void {
    // If the pixel size or color of the square changes, recreate the square
    if(this.pixelSize !== this.visualization.squareSize
    || this.even !== even) {
      this.pixelSize = this.visualization.squareSize
      this.even = even
      // Recreate the square and arrow at the proper size and position
      this.destroy()
      this.createSquare()
    }
    // We can always safely set the rotation based on the direction without
    // keeping track of its previous position - no need to recreate it
    this.arrow.rotation = Math.PI / 2 * direction
  }

  public destroy():void {
    this.square.removeChild(this.arrow)
    this.arrow.destroy()
    this.visualization.board.removeChild(this.square)
    this.square.destroy()
  }

  // We keep track of even/odd in an instance variable to see if we need to
  // recreate the square; I'd prefer to pass it, but hey we already have it
  private createSquare():void {
    this.square = new PIXI.Graphics()
    this.square.position =
      this.visualization.boardPositionToPixels(this.position)
    this.square.beginFill(PIXI.utils.rgb2hex(
      this.even
        ? config.square.even.fill
        : config.square.odd.fill
    ))
    // Center it on the pixel position for the board position
    this.square.drawRect(
      -this.pixelSize / 2,
      -this.pixelSize / 2,
      this.pixelSize,
      this.pixelSize
    )
    this.square.endFill()
    this.createArrow()
    this.visualization.board.addChild(this.square)
  }

  // Arrow size is calculated relative to square size
  // Full of "magic numbers": TBD to move these to config
  private createArrow():void {
    // Currently, only its color is configurable, and no stroke
    this.arrow = new PIXI.Graphics()
    this.arrow.beginFill(PIXI.utils.rgb2hex(config.arrow.fill))
    // The body of the arrow
    this.arrow.drawRect(
      -this.visualization.squareSize / 12,
      -this.visualization.squareSize * .2,
      this.visualization.squareSize / 6,
      this.visualization.squareSize * .6)
    // The arrowhead
    this.arrow.drawPolygon([
      new PIXI.Point(0, -this.visualization.squareSize * .4),
      new PIXI.Point(
        -this.visualization.squareSize * .25,
        -this.visualization.squareSize * .1
      ),
      new PIXI.Point(
        this.visualization.squareSize * .25,
        -this.visualization.squareSize * .1
      )
    ])
    this.arrow.endFill()
    // The reset() instance method sets the arrow's rotation on a
    // resize or shuffle; no need to set it here
    this.square.addChild(this.arrow)
  }
}
