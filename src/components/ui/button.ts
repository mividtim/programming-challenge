import * as PIXI from 'pixi.js'

export class Button extends PIXI.Graphics {

  public constructor(
    label:string,
    style:ButtonStyle
  ) {
    super()
    // Set the styles from the config and draw to configured size
    this.lineStyle(style.strokeThickness, style.stroke)
    this.beginFill(style.fill)
    this.drawRect(-style.width / 2, -style.height / 2, style.width, style.height)
    this.endFill()
    // Add styled button text
    const text:PIXI.Text = new PIXI.Text(label, style.textStyle)
    // Center the text on the button
    text.anchor.set(.5)
    this.addChild(text)
    // Set up the event handlers
    this.interactive = true
    this.on('mouseup', () => this.emit('pressed'))
    this.on('touchend', () => this.emit('pressed'))
  }
}

export class ButtonStyle {

  public width:number
  public height:number
  public textStyle:PIXI.TextStyle
  public fill:number
  public stroke:number
  public strokeThickness:number

  public constructor(
    width:number,
    height:number,
    textStyle:PIXI.TextStyle,
    fill:number = 0x542121,
    strokeThickness:number = 0,
    stroke:number = 0xededed
  ) {
    this.width = width
    this.height = height
    this.textStyle = textStyle
    this.fill = fill
    this.strokeThickness = strokeThickness
    this.stroke = stroke
  }
}
