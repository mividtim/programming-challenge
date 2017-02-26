import * as PIXI from 'pixi.js'
import {BoardPosition} from './board-layout'
import {Checker} from './checker'
import {CheckerSquare} from './checker-square'

// Define Square as newable to allow "new this.createSquare" to create a new
// Square. This forces Square's constructor to same parameter list as
// CheckerSquare, which will allow the board to create squares of the
// appropriate type (generic Square)
interface CreateSquare<Square extends CheckerSquare> {
  new (
    position:BoardPosition,
    pixelSize:number,
    even:boolean,
    oddColor:number,
    evenColor:number
  ):Square
}

export class CheckerBoard<Square extends CheckerSquare> extends PIXI.Container {

  public size:number
  protected pixelSize:number
  protected oddColor:number
  protected evenColor:number
  public squareSize:number
  protected squares:Square[][] = []
  // I haven't yet figured out how to set a default value here
  // (desired: CheckerSquare); so I use a conditional in this.setupSquare()
  private createSquare:CreateSquare<Square>

  public constructor(
    size:number,
    pixelSize:number,
    oddColor:number = 0x111111,
    evenColor:number = 0xee1111,
    // I haven't yet figured out how to set a default value here
    // (desired: CheckerSquare); so I use a conditional in this.setupSquare()
    createSquare:CreateSquare<Square> = null
  ) {
    super()
    this.pixelSize = pixelSize
    this.oddColor = oddColor
    this.evenColor = evenColor
    this.createSquare = createSquare
    this.resize(size)
  }

  public resize(size:number):void {
    this.size = size
    this.squareSize = this.pixelSize / this.size
    this.shrink()
    this.expandAndColorize()
  }

  public toTop(object:PIXI.DisplayObject):void {
    this.removeChild(object)
    this.addChild(object)
  }

  public boardPositionToPixels(boardPosition:BoardPosition):PIXI.Point {
    return new PIXI.Point(
      (boardPosition.col - this.size / 2) * this.squareSize + this.squareSize / 2,
      (boardPosition.row - this.size / 2) * this.squareSize + this.squareSize / 2
    )
  }

  // Destroy extra board positions if the new board layout is smaller than the
  // last board
  private shrink():void {
    while(this.squares.length > this.size) {
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

  // Add squares of the appropriate size, color, and position to fill the
  // board's pixel size; resize and set position and color for existing squares
  private expandAndColorize():void {
    // even tracks the alternating square colors
    let even:boolean = false
    // Iterate over the board positions for the given board size
    for(let row:number = 0 ; row < this.size ; row++) {
      // Add the row if our board isn't that big yet
      if(row > this.squares.length - 1)
        this.squares.push([])
      for(let col:number = 0 ; col < this.size ; col++) {
        this.setupSquare(new BoardPosition(row, col), even)
        // Stagger the square colors
        even = !even
      }
      // For even-sized boards, have to stagger the square colors back
      if(this.size % 2 === 0)
        even = !even
    }
  }

  private setupSquare(position:BoardPosition, even:boolean):void {
    let square:Square
    // If we don't yet have a square for this position, create it
    if(position.col > this.squares[position.row].length - 1) {
      // I haven't yet figured out how to set a default value for
      // this.createSquare, so I use a conditional here for the default
      square = this.createSquare
        ? new this.createSquare(
          position,
          this.squareSize,
          even,
          this.oddColor,
          this.evenColor
        )
        : new CheckerSquare(
          position,
          this.squareSize,
          even,
          this.oddColor,
          this.evenColor
        ) as Square
      this.addChild(square)
      this.squares[position.row].push(square)
    }
    // If we do have a square at this position already, tell it to reset
    // its position, color, and arrow direction if needed
    else {
      square = this.squares[position.row][position.col]
      square.reset(this.squareSize, even)
    }
    square.position = this.boardPositionToPixels(position)
  }
}
