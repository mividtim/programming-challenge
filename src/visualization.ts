import * as fs from 'fs'
import * as PIXI from 'pixi.js'
import {TweenLite} from 'gsap/TweenLite'
import {Direction, Position, SimulationState} from './types'
import {Simulation} from './simulation'
import {SoundManager} from './sound-manager'
import {Square} from './square'

const config =
  JSON.parse(fs.readFileSync('./config.json', 'utf-8')).visualization

export class Visualization {

  private simulation:Simulation
  // Event handlers for the buttons, passed from the controller
  private onplay:()=>void
  private onstop:()=>void
  private onresize:(amount:number)=>void
  private onshuffle:()=>void
  private stage:PIXI.Container
  // Board is public so Squares can handling adding their square:PIXI.Graphics
  // to it; could use some instane methods here to protect it, instead
  public board:PIXI.Container
  private checker1:PIXI.DisplayObject
  private checker2:PIXI.DisplayObject
  // Public so Squares can see; could use an instance method to protect it
  public squareSize:number
  private renderer:PIXI.WebGLRenderer
  private squares:Square[][] = []
  private message:PIXI.Text
  private soundManager:SoundManager = new SoundManager(config.sounds)

  public constructor(
    simulation:Simulation,
    onplay:()=>void,
    onstop:()=>void,
    onresize:(amount:number)=>void,
    onshuffle:()=>void
  ) {
    // Keep a copy of the simulation for reference by instance methods
    this.simulation = simulation
    // Set up the button event handlers to we can tell the controller when
    // they're pressed
    this.onplay = onplay
    this.onstop = onstop
    this.onresize = onresize
    this.onshuffle = onshuffle
    // The root stage container is passed into render() by renderLoop()
    // It will contain the message, the board, and the buttons
    this.stage = new PIXI.Container()
    // Set up the renderer, add the canvas to the page, and start the render
    // loop (renders every frame with requestAnimationFrame)
    this.renderer =
      new PIXI.WebGLRenderer(
        document.documentElement.clientWidth,
        document.documentElement.clientHeight,
        {antialias: true})
    document.body.appendChild(this.renderer.view)
    this.renderLoop()
    // This adds the message and buttons to the stage
    this.createUI()
    // The board will contain the checkers and squares
    this.stage.addChild(this.board = new PIXI.Container())
    this.board.position = new PIXI.Point(
      this.renderer.width / 2,
      this.renderer.height / 2 - config.button.height / 2
    )
    // refresh() adds the squares, and their arrows, to the board
    // It will add squares of the appropriate size and position themselves to
    // fill the simulation size. It will also destroy extra squares when the
    // simulation is downsized.
    this.refresh()
    // restart() moves the checkers to the starting position and places them
    // on top of all board squares (including new ones)
    this.restart()
  }

  public refresh():void {
    // Determine the square size based on the window size and simulation size
    const boardSize:number =
      Math.min(this.renderer.width, this.renderer.height)
        - this.message.height
        - config.button.height
        - config.button.fromBottom
        - config.message.fromTop
        - config.margin * 2
    this.squareSize = boardSize / this.simulation.size
    if(this.checker1) {
      this.board.removeChild(this.checker1)
      this.board.removeChild(this.checker2)
      this.checker1.destroy()
      this.checker2.destroy()
    }
    // The checkers are children of the board so they can be positioned
    // using the same routine as the squares, boardPositionToPixels()
    this.checker1 = this.createChecker()
    this.checker2 = this.createChecker()
    // Delete any squares that exceed the current simulation layout size
    this.shrinkBoardAsNeeded()
    // Create squares as needed, set their position and color,
    // and set all arrow directions from the simulation layout
    this.setupBoard()
  }

  public restart():void {
    // Stop any ongoing animations
    TweenLite.killTweensOf(this.checker1.position)
    TweenLite.killTweensOf(this.checker1.scale)
    TweenLite.killTweensOf(this.checker2.position)
    // Move the checkers to the simulation starting positions
    const pixelPosition:PIXI.Point =
      this.boardPositionToPixels(this.simulation.startingPosition)
    this.checker1.position = pixelPosition
    this.checker2.position = pixelPosition
    this.board.removeChild(this.checker1)
    this.board.removeChild(this.checker2)
    this.board.addChild(this.checker1)
    this.board.addChild(this.checker2)
    // Resize the first checker to scale one, since it is shrunk to zero scale
    // when a simulation is completed
    this.checker1.scale.set(1, 1)
  }

  // Called by the controller to set the appropriate text at screen top
  public showMessage(message:string):void {
    this.message.text = message
  }

  // Called by the controller to move the checker to a new position
  public moveChecker(number:number, position:Position):void {
    const checker:PIXI.DisplayObject =
      number === 1 ? this.checker1 : this.checker2
    const pixelPosition:PIXI.Point = this.boardPositionToPixels(position)
    // Use the Greensock TweenLite library to animate the movement
    TweenLite.to(
      checker.position,
      config.checker.moveTime,
      {x: pixelPosition.x, y: pixelPosition.y}
    )
    this.soundManager.play('move')
  }

  // Called by the controller when the simulation ends
  // The state is a determination of whether or not the path is circular
  public endVisualization(state:SimulationState) {
    // Shrink the first checker to scale zero
    TweenLite.to(this.checker1.scale, .5, {x: 0, y: 0})
    // Play collision or fall sound
    switch(state) {
      case SimulationState.Circular:
        this.soundManager.play('collide')
        break
      case SimulationState.Noncircular:
        this.soundManager.play('fall')
        break
    }
  }

  public boardPositionToPixels(boardPosition:Position):PIXI.Point {
    return new PIXI.Point(
      (boardPosition.col - this.simulation.size / 2) * this.squareSize + this.squareSize / 2,
      (boardPosition.row - this.simulation.size / 2) * this.squareSize + this.squareSize / 2
    )
  }

  // Creates the message and the buttons, and set up the event handling
  // The positioning could certainly use some enhancement - TDB
  // Dynamically centering them as they are added to a container, for example
  private createUI() {
    const positionY =
      this.renderer.height - config.button.fromBottom - config.button.height / 2
    // Resize+ Button
    // Reduce the simulation size by one when pressed
    this.createButton(
      new PIXI.Point(
        this.renderer.width / 2
          - config.button.width * 1.5
          - config.margin * 1.5,
        positionY
      ),
      '-',
      () => this.onresize(-1),
      true // small button
    )
    // Resize- Button
    // Increase the simulation size by one when pressed
    this.createButton(
      new PIXI.Point(
        this.renderer.width / 2 - config.button.width * 2 - config.margin,
        positionY
      ),
      '+',
      () => this.onresize(1),
      true // small button
    )
    // Shuffle Button
    // Shuffle the arrow directions
    this.createButton(
      new PIXI.Point(
        this.renderer.width / 2 - config.button.width / 2 - config.margin / 2,
        positionY
      ),
      'Shuffle',
      this.onshuffle
    )
    // Play Button
    // Start the simulation; the controller will handle delaying the
    // simulation's iterator to allow the visualization time to animate
    this.createButton(
      new PIXI.Point(
        this.renderer.width / 2 + config.button.width / 2 + config.margin / 2,
        positionY
      ),
      'Play',
      this.onplay
    )
    // Stop Button
    // Stop the simluation and move the checkers back to starting position
    this.createButton(
      new PIXI.Point(
        this.renderer.width / 2 + config.button.width * 1.5 + config.margin,
        positionY
      ),
      'Stop',
      this.onstop
    )
    // Message that appears on the top of the screen
    // The message text is set by the controller using showMessage()
    this.stage.addChild(this.message = new PIXI.Text('Press Play to Begin', {
      align: config.message.align,
      lineJoin: config.message.lineJoin,
      fill: config.message.fill.map(color => PIXI.utils.rgb2hex(color)),
      stroke: PIXI.utils.rgb2hex(config.message.stroke),
      strokeThickness: config.message.strokeThickness
    }))
    this.message.anchor.set(.5, 0)
    this.message.position = new PIXI.Point(
      this.renderer.width / 2,
      config.message.fromTop
    )
  }

  private createButton(
    position:PIXI.Point,
    label:string,
    action:{():void},
    small:boolean = false
  ):PIXI.Graphics {
    const button:PIXI.Graphics = new PIXI.Graphics()
    // Small buttons are half the configured width
    const width:number = config.button.width * (small ? .5 : 1)
    // Center the button at the given position
    // Keeps centering of text simpler than moving top/left of drawRect
    button.position = new PIXI.Point(
      position.x - width / 2,
      position.y - config.button.height / 2
    )
    // Set the styles from the config and draw to configured size
    button.lineStyle(
      config.button.strokeThickness,
      PIXI.utils.rgb2hex(config.button.stroke)
    )
    button.beginFill(PIXI.utils.rgb2hex(config.button.fill))
    button.drawRect(0, 0, width, config.button.height)
    button.endFill()
    // Add styled button text
    const text:PIXI.Text = new PIXI.Text(label, {
      align: config.button.text.align,
      lineJoin: config.button.text.lineJoin,
      fill: PIXI.utils.rgb2hex(config.button.text.fill),
      stroke: PIXI.utils.rgb2hex(config.button.text.stroke),
      strokeThickness: config.button.text.strokeThickness
    })
    // Center the text on the button
    text.position = new PIXI.Point(width / 2, config.button.height / 2)
    text.anchor.set(.5)
    button.addChild(text)
    // Set up the event handlers
    button.interactive = true
    button.on('mouseup', action)
    button.on('touchend', action)
    this.stage.addChild(button)
    return button
  }

  private createChecker():PIXI.Graphics {
    const checker:PIXI.Graphics = new PIXI.Graphics()
    // Semi-transparent so that the arrows can be seen
    checker.alpha = config.checker.alpha
    checker.lineStyle(
      config.checker.strokeThickness,
      PIXI.utils.rgb2hex(config.checker.stroke)
    )
    checker.beginFill(PIXI.utils.rgb2hex(config.checker.fill))
    // Set scale relative to square size
    checker.drawCircle(0, 0, this.squareSize * config.checker.relativeSize)
    checker.endFill()
    this.board.addChild(checker)
    return checker
  }

  private shrinkBoardAsNeeded():void {
    // Destroy extra board positions if the new layout is smaller than the
    // last board
    while(this.squares.length > this.simulation.size) {
      // Delete the last row
      const row:Square[] = this.squares[this.squares.length - 1]
      while(row.length > 0)
        row.pop().destroy()
      this.squares.pop()
      // Delete the last column from each row
      for(let row of this.squares)
        row.pop().destroy()
    }
  }

  private setupBoard():void {
    // even tracks the alternating square colors
    let even:boolean = false
    // Iterate over the board positions for the given board size
    for(let row:number = 0 ; row < this.simulation.size ; row++) {
      // Add the row if our board isn't that big yet
      if(row > this.squares.length - 1)
        this.squares.push([])
      for(let col:number = 0 ; col < this.simulation.size ; col++) {
        const position:Position = new Position(row, col)
        // The simulation layout gives us the arrow direction to draw
        const direction:Direction = this.simulation.layout[row][col]
        this.setupSquare(position, even, direction)
        // Stagger the square colors
        even = !even
      }
      // For even-sized boards, have to stagger the square colors back
      if(this.simulation.size % 2 === 0)
        even = !even
    }
  }

  private setupSquare(
    position:Position,
    even:boolean,
    direction:Direction
  ):void {
    // If we don't yet have a square for this position, create it
    if(position.col > this.squares[position.row].length - 1) {
      this.squares[position.row].push(
        new Square(this, position, even, direction))
    }
    // If we do have a square at this position already, tell it to reset
    // its position, color, and arrow direction if needed
    else {
      this.squares[position.row][position.col].reset(even, direction)
    }
  }

  // Fat arrow to preserve "this"
  private renderLoop = ():void => {
    requestAnimationFrame(this.renderLoop)
    this.renderer.render(this.stage)
  }
}
