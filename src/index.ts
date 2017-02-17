/// <reference path="../typings/index.d.ts" />
import PIXI = require('pixi.js')

const SCREEN_WIDTH:number = 1280
const SCREEN_HEIGHT:number = 720
const INITIAL_COLS:number = 20
const INITIAL_ROWS:number = 10
const rowOR_EVEN:number = 0xee0000
const rowOR_ODD:number = 0x333333
const rowOR_ARcol:number = 0xeeeeee
const rowOR_CHECKER:number = 0x00eeee

const enum DIRECTION {
  Up = 0,
  Right,
  Down,
  Left
}

const renderer:PIXI.WebGLRenderer = new PIXI.WebGLRenderer(SCREEN_WIDTH, SCREEN_HEIGHT)
document.body.appendChild(renderer.view)

// You need to create a root container that will hold the scene you want to draw.
const stage:PIXI.Container = new PIXI.Container()

renderLoop(stage)
newGame(INITIAL_ROWS, INITIAL_COLS)

function newGame(rows:number, cols:number):void {
  clearContainer(stage)
  const boardLayout:number[][] = newBoardLayout(rows, cols)
  console.log(boardLayout)
  const squareSize:number = Math.min(SCREEN_WIDTH / cols, SCREEN_HEIGHT / rows) * .9
  const gameBoard:PIXI.Container = createBoard(boardLayout, squareSize)
  const checker:PIXI.DisplayObject = createChecker(squareSize)
  gameBoard.addChild(checker)
  stage.addChild(gameBoard)
  const checkerPosition:PIXI.Point = randomPosition(boardLayout)
  checker.position = boardPositionToPixels(boardLayout, squareSize, checkerPosition)
  play(checker, boardLayout, checkerPosition, squareSize)
}

function play(checker:PIXI.DisplayObject, boardLayout:number[][], startingPosition:PIXI.Point, squareSize:number):void {
  const rows:number = boardLayout.length
  const cols:number = boardLayout[0].length
  checker.position = boardPositionToPixels(boardLayout, squareSize, startingPosition)
  if(startingPosition.x < 0 || startingPosition.x > rows - 1 || startingPosition.y < 0 || startingPosition.y > cols - 1)
    console.log("Fell off the board!", startingPosition.x, startingPosition.y)
  else {
    const direction:DIRECTION = boardLayout[startingPosition.x][startingPosition.y]
    let nextPosition:PIXI.Point
    switch(direction) {
      case DIRECTION.Up:
        nextPosition = new PIXI.Point(startingPosition.x - 1, startingPosition.y)
        break;
      case DIRECTION.Down:
        nextPosition = new PIXI.Point(startingPosition.x + 1, startingPosition.y)
        break;
      case DIRECTION.Left:
        nextPosition = new PIXI.Point(startingPosition.x, startingPosition.y - 1)
        break;
      case DIRECTION.Right:
        nextPosition = new PIXI.Point(startingPosition.x, startingPosition.y + 1)
        break;
    }
    setTimeout((() => play(checker, boardLayout, nextPosition, squareSize)), 500)
  }
}

function newBoardLayout(rows, cols):number[][] {
  const boardLayout:number[][] = []
  for(let row:number = 0 ; row < rows ; row++) {
    boardLayout.push([])
    for(let col:number = 0 ; col < cols ; col++) {
      const boardPosition:PIXI.Point = new PIXI.Point(row, col)
      const arcolDirection:DIRECTION = Math.floor(Math.random() * 4)
      boardLayout[row].push(arcolDirection)
    }
  }
  return boardLayout
}

function createBoard(boardLayout:number[][], squareSize:number):PIXI.Container {
  const rows = boardLayout.length
  const cols = boardLayout[0].length
  const gameBoard:PIXI.Container = new PIXI.Container()
  gameBoard.position = new PIXI.Point(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2)
  let even:boolean = false
  gameBoard.removeChildren()
  for(let row:number = 0 ; row < rows ; row++) {
    for(let col:number = 0 ; col < cols ; col++) {
      const boardPosition:PIXI.Point = new PIXI.Point(row, col)
      const square:PIXI.Graphics = createSquare(squareSize, even)
      square.position = boardPositionToPixels(boardLayout, squareSize, boardPosition)
      gameBoard.addChild(square)
      square.addChild(createArcol(squareSize, boardLayout[row][col]))
      even = !even
    }
    if(rows % 2 === 0)
      even = !even
  }
  return gameBoard
}

function createSquare(size:number, even:boolean):PIXI.Graphics {
  const square:PIXI.Graphics = new PIXI.Graphics()
  square.beginFill(even ? rowOR_EVEN : rowOR_ODD)
  square.drawRect(-size / 2, -size / 2, size, size)
  square.endFill()
  return square
}

function createArcol(size:number, direction:DIRECTION):PIXI.Graphics {
  const arcol:PIXI.Graphics = new PIXI.Graphics()
  arcol.beginFill(rowOR_ARcol)
  arcol.drawRect(-size / 12, -size * .2, size / 6, size * .6)
  arcol.drawPolygon([
    new PIXI.Point(0, -size * .4),
    new PIXI.Point(-size * .25, -size * .1),
    new PIXI.Point(size * .25, -size * .1)
  ])
  arcol.endFill()
  arcol.rotation = Math.PI / 2 * direction
  return arcol
}

function createChecker(size:number):PIXI.Graphics {
  const checker:PIXI.Graphics = new PIXI.Graphics()
  checker.alpha = .75
  checker.beginFill(rowOR_CHECKER)
  checker.drawCircle(0, 0, size * .3)
  checker.endFill()
  return checker
}

function boardPositionToPixels(boardLayout:number[][], size:number, boardPosition:PIXI.Point):PIXI.Point {
  return new PIXI.Point(
    (boardPosition.y - boardLayout[0].length / 2) * size,
    (boardPosition.x - boardLayout.length / 2) * size
  )
}

function randomPosition(boardLayout:number[][]):PIXI.Point {
  return new PIXI.Point(
      Math.floor(Math.random() * boardLayout.length),
      Math.floor(Math.random() * boardLayout[0].length)
  )
}

function clearContainer(container:PIXI.Container):void {
  container.children.forEach(function(child:PIXI.DisplayObject) { child.destroy() })
}

function renderLoop(stage:PIXI.Container):void {
    // start the timer for the next animation loop
    requestAnimationFrame(() => renderLoop(stage))
    // each frame we spin the bunny around a bit
    // this is the main render call that makes pixi draw your container and its children.
    renderer.render(stage)
}
