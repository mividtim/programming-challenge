import * as fs from 'fs'
import * as EventEmitter from 'events'
import * as PIXI from 'pixi.js'
import {TweenLite} from 'gsap/TweenLite'
import {SoundManager} from './sound-manager'
import {
  BoardPosition,
  Direction,
  BoardLayout
} from './components/checkers/board-layout'
import {Button, ButtonStyle} from './components/ui/button'
import {Checker} from './components/checkers/checker'
import {DirectedCheckerBoard} from
  './components/checkers/directed/directed-checker-board'
import {HorizontalCenter} from './components/layouts/horizontal-center'
import {FullScreenHeaderFooter} from
  './components/layouts/full-screen-header-footer'

const config =
  JSON.parse(fs.readFileSync('./config.json', 'utf-8')).visualization

export class Visualization extends EventEmitter {

  private screenLayout:FullScreenHeaderFooter
  private board:DirectedCheckerBoard
  private checker1:Checker
  private checker2:Checker
  private renderer:PIXI.WebGLRenderer
  private message:PIXI.Text
  private soundManager:SoundManager = new SoundManager(config.sounds)

  public constructor(boardLayout:BoardLayout) {
    super()
    // This creates the full-screen layout and adds the message to the header
    // and buttons to the footer
    this.setupUI()
    this.setupBoard(boardLayout)
    this.setupCheckers()
    // Create a WebGL renderer at window dimensions; begin render loop
    this.startRendering()
  }

  public setBoardLayout(boardLayout:BoardLayout):void {
    // Stop any ongoing animations
    this.stop()
    // Resize the board as needed - the board takes care of creating squares
    if(this.board.size !== boardLayout.length)
      this.resize(boardLayout.length)
    // Set the arrow directions on the board
    this.board.setBoardLayout(boardLayout)
    // Make sure the checkers are on top of any new squares
    this.board.toTop(this.checker1)
    this.board.toTop(this.checker2)
  }

  // Resize the first checker to scale one, since it is shrunk to zero scale
  // when a simulation is started
  public restart():void {
    this.checker1.scale.set(1, 1)
  }

  // Stop any ongoing animations
  public stop() {
    TweenLite.killTweensOf(this.checker1.position)
    TweenLite.killTweensOf(this.checker1.scale)
    TweenLite.killTweensOf(this.checker2.position)
  }

  // Show the given text at screen top
  public showMessage(message:string):void {
    this.message.text = message
  }

  // Place the given checker at the given position, without animating
  public placeChecker(number:number, position:BoardPosition) {
    const checker:PIXI.DisplayObject =
      number === 1 ? this.checker1 : this.checker2
    checker.position = this.board.boardPositionToPixels(position)
  }

  // Animate moving the checker to a new position
  public moveChecker(number:number, position:BoardPosition):void {
    const checker:PIXI.DisplayObject =
      number === 1 ? this.checker1 : this.checker2
    const pixelPosition:PIXI.Point = this.board.boardPositionToPixels(position)
    // Use the Greensock TweenLite library to animate the movement
    TweenLite.to(
      checker.position,
      config.checker.moveTime,
      {x: pixelPosition.x, y: pixelPosition.y}
    )
    this.soundManager.play('move')
  }

  public collide() {
    // Shrink the first checker to scale zero
    TweenLite.to(this.checker1.scale, .5, {x: 0, y: 0})
    this.soundManager.play('collide')
  }

  public fall() {
    // Shrink the first checker to scale zero
    TweenLite.to(this.checker1.scale, .5, {x: 0, y: 0})
    this.soundManager.play('fall')
  }

  private startRendering():void {
    // The screenLayout container is passed into render() by renderLoop()
    // It contains the message, the board, and the buttons
    // Set up the renderer, add the canvas to the page, and start the render
    // loop (renders every frame with requestAnimationFrame)
    this.renderer =
      new PIXI.WebGLRenderer(
        document.documentElement.clientWidth,
        document.documentElement.clientHeight,
        // Smooth edges of curves created with PIXI.Graphics
        {antialias: true})
    document.body.appendChild(this.renderer.view)
    this.renderLoop()
  }

  // Fat arrow to preserve "this"
  private renderLoop = ():void => {
    requestAnimationFrame(this.renderLoop)
    this.renderer.render(this.screenLayout)
  }

  // Creates the message and the buttons, and set up the event handling
  private setupUI():void {
    this.message = this.createMessage()
    const header:PIXI.Container = new HorizontalCenter(config.margin)
    header.addChild(this.message)
    const footer:PIXI.Container = this.createButtons()
    this.screenLayout = new FullScreenHeaderFooter(
      new HorizontalCenter(),
      header,
      footer,
      config.margin)
  }

  private createMessage():PIXI.Text {
    // Message that appears on the top of the screen
    // The message text is set by the controller using showMessage()
    const message:PIXI.Text = new PIXI.Text(
      'Press Play to Begin',
      new PIXI.TextStyle({
        align: config.message.align,
        lineJoin: config.message.lineJoin,
        fill: config.message.fill.map(color => PIXI.utils.rgb2hex(color)),
        stroke: PIXI.utils.rgb2hex(config.message.stroke),
        strokeThickness: config.message.strokeThickness
      })
    )
    message.anchor.set(.5)
    message.position = new PIXI.Point(0, config.message.fromTop)
    return message
  }

  private createButtons():PIXI.Container {
    const buttons = new HorizontalCenter(config.margin)
    const buttonTextStyle:PIXI.TextStyle = new PIXI.TextStyle({
      align: config.button.text.align,
      lineJoin: config.button.text.lineJoin,
      fill: PIXI.utils.rgb2hex(config.button.text.fill),
      stroke: PIXI.utils.rgb2hex(config.button.text.stroke),
      strokeThickness: config.button.text.strokeThickness
    })
    const buttonStyle:ButtonStyle = new ButtonStyle(
      config.button.width,
      config.button.height,
      buttonTextStyle,
      PIXI.utils.rgb2hex(config.button.fill),
      config.button.strokeThickness,
      PIXI.utils.rgb2hex(config.button.stroke)
    )
    const smallButtonStyle:ButtonStyle = new ButtonStyle(
      config.button.width / 2,
      config.button.height,
      buttonTextStyle,
      PIXI.utils.rgb2hex(config.button.fill),
      config.button.strokeThickness,
      PIXI.utils.rgb2hex(config.button.stroke)
    )
    // Reduce the simulation size by one
    const resizeDownButton:Button = new Button('-', smallButtonStyle)
    resizeDownButton.on('pressed', () => this.emit('resize', -1))
    buttons.addChild(resizeDownButton)
    // Increase the simulation size by one
    const resizeUpButton:Button = new Button('+', smallButtonStyle)
    resizeUpButton.on('pressed', () => this.emit('resize', 1))
    buttons.addChild(resizeUpButton)
    // Shuffle the arrow directions
    const shuffleButton:Button = new Button('Shuffle', buttonStyle)
    shuffleButton.on('pressed', () => this.emit('shuffle'))
    buttons.addChild(shuffleButton)
    // Start the simulation; the controller will handle delaying the
    // simulation's iterator to allow the visualization time to animate
    const playButton:Button = new Button('Play', buttonStyle)
    playButton.on('pressed', () => this.emit('play'))
    buttons.addChild(playButton)
    // Stop the simluation and move the checkers back to starting position
    const stopButton:Button = new Button('Stop', buttonStyle)
    stopButton.on('pressed', () => this.emit('stop'))
    buttons.addChild(stopButton)
    return buttons
  }

  private setupBoard(boardLayout:BoardLayout) {
    // TBD: Move this sort of logic to layout container class
    const boardPixelSize:number =
      Math.min(this.screenLayout.bodyWidth, this.screenLayout.bodyHeight)
    // The board will contain the checkers and squares
    this.screenLayout.addToBody(
      this.board = new DirectedCheckerBoard(
        boardLayout,
        boardPixelSize,
        PIXI.utils.rgb2hex(config.board.odd.fill),
        PIXI.utils.rgb2hex(config.board.even.fill),
      )
    )
    this.board.position = new PIXI.Point(
      0,
      this.screenLayout.bodyHeight / 2
    )
  }

  private setupCheckers() {
    // The checkers are children of the board for proper positioning
    this.board.addChild(this.checker1 = new Checker(
      this.board.squareSize * config.checker.relativeSize,
      // Semi-transparent so that the arrows can be seen
      config.checker.alpha,
      config.checker.strokeThickness,
      PIXI.utils.rgb2hex(config.checker.stroke),
      PIXI.utils.rgb2hex(config.checker.fill)
    ))
    this.board.addChild(this.checker2 = new Checker(
      this.board.squareSize * config.checker.relativeSize,
      // Semi-transparent so that the arrows can be seen
      config.checker.alpha,
      config.checker.strokeThickness,
      PIXI.utils.rgb2hex(config.checker.stroke),
      PIXI.utils.rgb2hex(config.checker.fill)
    ))
  }

  private resize(size:number):void {
    // Create squares as needed, set their position and color,
    // and set all arrow directions from the simulation layout
    this.board.resize(size)
    this.checker1.resize(this.board.squareSize * config.checker.relativeSize)
    this.checker2.resize(this.board.squareSize * config.checker.relativeSize)
  }
}
