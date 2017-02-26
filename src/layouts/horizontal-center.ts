import * as PIXI from 'pixi.js'

export class HorizontalCenter extends PIXI.Container {

  private margin:number

  public constructor(margin:number = 0) {
    super()
    this.setMargin(margin)
    this.onChildrenChange = this.repositionChildren
  }

  public setMargin(margin:number) {
    this.margin = margin
    this.repositionChildren()
  }

  private repositionChildren():void {
    const fullWidth:number =
      this.children
        .map(child => child.getLocalBounds().width)
        .reduce((sum, width) => sum += width, 0)
      + this.margin * this.children.length - 1
    let left:number = -fullWidth / 2
    for(let c:number = 0 ; c < this.children.length ; c++) {
      const child:PIXI.DisplayObject = this.children[c]
      const width = child.getLocalBounds().width
      // Center each item on its position
      child.position.x = left + width / 2
      left += width + this.margin
    }
  }
}
