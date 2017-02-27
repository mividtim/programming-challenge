import * as PIXI from 'pixi.js'

export class FullScreenHeaderFooter extends PIXI.Container {

  private body:PIXI.Container
  public readonly bodyWidth:number
  public readonly bodyHeight:number

  public constructor(
    body:PIXI.Container,
    header:PIXI.DisplayObject = null,
    footer:PIXI.DisplayObject = null,
    margin:number = 0
  ) {
    super()
    this.body = body
    const screenWidth = document.documentElement.clientWidth
    const screenHeight = document.documentElement.clientHeight
    const headerHeight = margin + (header ? header.getLocalBounds().bottom : 0)
    const footerHeight = margin + (footer ? footer.getLocalBounds().bottom : 0)
    if(header) {
      this.addChild(header)
      header.position = new PIXI.Point(screenWidth / 2, margin)
    }
    this.addChild(body)
    body.position = new PIXI.Point(screenWidth / 2, headerHeight + margin)
    if(footer) {
      this.addChild(footer)
      footer.position = new PIXI.Point(screenWidth / 2, screenHeight - footerHeight - margin)
    }
    this.bodyWidth = screenWidth
    this.bodyHeight = screenHeight - headerHeight - footerHeight - margin * 6
  }

  public addToBody(child:PIXI.DisplayObject):PIXI.DisplayObject {
    return this.body.addChild(child)
  }
}
