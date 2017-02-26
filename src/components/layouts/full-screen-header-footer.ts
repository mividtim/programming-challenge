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
    this.body = body
    const screenWidth = document.documentElement.clientWidth
    const screenHeight = document.documentElement.clientHeight
    const headerHeight = header ? header.getLocalBounds().height : 0
    const footerHeight = footer ? footer.getLocalBounds().height : 0
    if(header) {
      this.addChild(header)
      header.position = new PIXI.Point(screenWidth / 2, 0)
    }
    this.addChild(body)
    body.position = new PIXI.Point(screenWidth / 2, headerHeight * 2)
    if(footer) {
      this.addChild(footer)
      footer.position = new PIXI.Point(screenWidth / 2, screenHeight - footerHeight / 2)
    }
    this.bodyWidth = screenWidth
    this.bodyHeight = screenHeight - headerHeight * 2 - footerHeight * 2
  }

  public addToBody(child:PIXI.DisplayObject):PIXI.DisplayObject {
    return this.body.addChild(child)
  }
}
