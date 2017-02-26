import * as PIXI from 'pixi.js'

export class Checker extends PIXI.Graphics {

  private strokeThickness:number
  private stroke:number
  private fill:number

  public constructor(
    size:number,
    alpha:number = 1,
    strokeThickness:number = 0,
    stroke = 0x000000,
    fill:number = 0x111111,
    lines:boolean = false,
  ) {
    super() //lines)
    // Semi-transparent so that the arrows can be seen
    this.alpha = alpha
    this.strokeThickness = strokeThickness
    this.stroke = stroke
    this.fill = fill
    this.resize(size)
  }

  public resize(size:number) {
    this.clear()
    this.lineStyle(this.strokeThickness, this.stroke)
    this.beginFill(this.fill)
    // Set scale relative to square size
    this.drawCircle(0, 0, size)
    this.endFill()
  }
}
