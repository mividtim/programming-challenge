import * as PIXI from 'pixi.js'

export class FullScreenHeaderFooter extends PIXI.Container {

  private body:PIXI.Container
  public readonly bodyWidth:number
  public readonly bodyHeight:number

  public constructor(
    body:PIXI.Container,
    header:PIXI.DisplayObject = null,
    footer:PIXI.DisplayObject = null,
  ) {
    super()
    const screenWidth = document.documentElement.clientWidth
    const screenHeight = document.documentElement.clientHeight
    const headerHeight = header ? header.getLocalBounds().height : 0
    const footerHeight = footer ? footer.getLocalBounds().height : 0
    if(header) {
      this.addChild(header)
      header.position = new PIXI.Point(screenWidth / 2, 0)
    }
    this.addChild(this.body = body)
    this.body.position = new PIXI.Point(screenWidth / 2, headerHeight)
    if(footer) {
      this.addChild(footer)
      footer.position = new PIXI.Point(screenWidth / 2, screenHeight - footerHeight)
    }
    this.bodyWidth = screenWidth
    this.bodyHeight = screenHeight - headerHeight - footerHeight
  }

  public addChild(
    child:PIXI.DisplayObject,
    ...children:PIXI.DisplayObject[]
  ):PIXI.DisplayObject {
    return this.body.addChild(child, ...children)
  }
}
