/// <reference path="../typings/index.d.ts" />
import PIXI = require('pixi.js')
import TweenLite = require('gsap/TweenLite')

const SCREEN_WIDTH:number = 1280
const SCREEN_HEIGHT:number = 720
const INITIAL_COLS:number = 20
const INITIAL_ROWS:number = 10
const COLOR_BUTTON:number = 0x444411
const COLOR_EVEN:number = 0xee1111
const COLOR_ODD:number = 0x111111
const COLOR_ARROW:number = 0xeeeeee
const COLOR_CHECKER:number = 0x11eeee
const BUTTON_WIDTH:number = 150
const BUTTON_HEIGHT:number = 50

const enum DIRECTION {
  Up = 0,
  Right,
  Down,
  Left
}

class Game {
  checker1:PIXI.DisplayObject
  checker2:PIXI.DisplayObject
  boardLayout:number[][]
  startingPosition:PIXI.Point
  squareSize:number
  constructor(checker1:PIXI.DisplayObject, checker2:PIXI.DisplayObject, boardLayout:number[][], startingPosition:PIXI.Point, squareSize:number) {
    this.checker1 = checker1
    this.checker2 = checker2
    this.boardLayout = boardLayout
    this.startingPosition = startingPosition
    this.squareSize = squareSize
  }
}

(function():void {
  const renderer:PIXI.WebGLRenderer = new PIXI.WebGLRenderer(SCREEN_WIDTH, SCREEN_HEIGHT)
  document.body.appendChild(renderer.view)
  const stage:PIXI.Container = new PIXI.Container()
  renderLoop(renderer, stage)
  const gameBoard:PIXI.Container = new PIXI.Container()
  gameBoard.position = new PIXI.Point(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - BUTTON_HEIGHT / 2)
  stage.addChild(gameBoard)
  const game:Game = newGame(gameBoard, INITIAL_ROWS, INITIAL_COLS)
  createControls(stage, gameBoard, game)
})()

function createControls(stage:PIXI.Container, gameBoard:PIXI.Container, game:Game) {
  stage.addChild(createButton(
    SCREEN_WIDTH / 2 - BUTTON_WIDTH / 2 - 20,
    SCREEN_HEIGHT - BUTTON_HEIGHT / 2 - 50,
    'New Game',
    () => game = newGame(gameBoard, INITIAL_ROWS, INITIAL_COLS)))
  stage.addChild(createButton(
    SCREEN_WIDTH / 2 + BUTTON_WIDTH / 2 + 20,
    SCREEN_HEIGHT - BUTTON_HEIGHT / 2 - 50,
    'Play',
    () => play(game)))
}

function createButton(x:number, y:number, label:string, action):PIXI.Graphics {
  const button = new PIXI.Graphics()
  button.position = new PIXI.Point(x - BUTTON_WIDTH / 2, y - BUTTON_HEIGHT / 2)
  button.lineStyle(2, 0xeeeeee)
  button.beginFill(COLOR_BUTTON)
  button.drawRect(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT)
  button.endFill()
  const text:PIXI.Text = new PIXI.Text(label, {stroke: 0xeeeeee, fill: 0x111111, strokeThickness: 2, align: 'center', lineJoin: 'round'})
  button.addChild(text)
  button.interactive = true
  button.on("mouseup", action)
  button.on("touchend", action)
  return button
}

function newGame(gameBoard:PIXI.Container, rows:number, cols:number):Game {
  const boardLayout:number[][] = newBoardLayout(rows, cols)
  const squareSize:number = Math.min(SCREEN_WIDTH / cols, SCREEN_HEIGHT / rows) * .8
  createBoard(gameBoard, boardLayout, squareSize)
  const startingPosition:PIXI.Point = randomPosition(boardLayout)
  const checker1:PIXI.DisplayObject = createChecker(squareSize)
  gameBoard.addChild(checker1)
  checker1.position = boardPositionToPixels(boardLayout, squareSize, startingPosition)
  const checker2:PIXI.DisplayObject = createChecker(squareSize)
  gameBoard.addChild(checker2)
  checker2.position = boardPositionToPixels(boardLayout, squareSize, startingPosition)
  return new Game(checker1, checker2, boardLayout, startingPosition, squareSize)
}

function play(game:Game, checker1Position:PIXI.Point = null, checker2Position:PIXI.Point = null, evenMove:boolean = false):void {
  if(!checker1Position) {
    checker1Position = new PIXI.Point(game.startingPosition.x, game.startingPosition.y)
    checker2Position = new PIXI.Point(game.startingPosition.x, game.startingPosition.y)
  }
  let gameEnded:boolean = false
  checker1Position = moveChecker(game.checker1, checker1Position, game.boardLayout, game.squareSize)
  // Have to check before moving the second checker
  gameEnded = testEndGame(game.boardLayout, checker1Position, checker2Position)
  if(!gameEnded && evenMove) {
    checker2Position = moveChecker(game.checker2, checker2Position, game.boardLayout, game.squareSize)
    gameEnded = testEndGame(game.boardLayout, checker1Position, checker2Position)
  }
  if(gameEnded)
    TweenLite.to(game.checker1.scale, .5, {x: 0, y: 0})
  else
    setTimeout(() => play(game, checker1Position, checker2Position, !evenMove), 500)
}

function moveChecker(checker:PIXI.DisplayObject, currentPosition:PIXI.Point, boardLayout:number[][], squareSize:number):PIXI.Point {
  const direction:DIRECTION = boardLayout[currentPosition.x][currentPosition.y]
  let nextPosition:PIXI.Point
  switch(direction) {
    case DIRECTION.Up:
      nextPosition = new PIXI.Point(currentPosition.x - 1, currentPosition.y)
      break;
    case DIRECTION.Down:
      nextPosition = new PIXI.Point(currentPosition.x + 1, currentPosition.y)
      break;
    case DIRECTION.Left:
      nextPosition = new PIXI.Point(currentPosition.x, currentPosition.y - 1)
      break;
    case DIRECTION.Right:
      nextPosition = new PIXI.Point(currentPosition.x, currentPosition.y + 1)
      break;
  }
  const pixelPosition:PIXI.Point = boardPositionToPixels(boardLayout, squareSize, nextPosition)
  TweenLite.to(checker.position, .3, {x: pixelPosition.x, y: pixelPosition.y})
  return nextPosition
}

function testEndGame(boardLayout:number[][], checker1Position:PIXI.Point, checker2Position:PIXI.Point):boolean {
  let endGame:boolean = false
  if(!validPosition(boardLayout, checker1Position)) {
    console.info('The path is noncircular')
    endGame = true
  }
  else if(samePosition(checker1Position, checker2Position)) {
    console.info('The path is circular')
    endGame = true
  }
  return endGame
}

function validPosition(boardLayout:number[][], position:PIXI.Point):boolean {
  return !(
    position.x < 0 ||
    position.x > boardLayout.length - 1 ||
    position.y < 0 ||
    position.y > boardLayout[0].length - 1
  )
}

function samePosition(position1:PIXI.Point, position2:PIXI.Point) {
  return position1.x === position2.x && position1.y === position2.y
}

function newBoardLayout(rows, cols):number[][] {
  const boardLayout:number[][] = []
  for(let row:number = 0 ; row < rows ; row++) {
    boardLayout.push([])
    for(let col:number = 0 ; col < cols ; col++) {
      const boardPosition:PIXI.Point = new PIXI.Point(row, col)
      const arrowDirection:DIRECTION = Math.floor(Math.random() * 4)
      boardLayout[row].push(arrowDirection)
    }
  }
  return boardLayout
}

function createBoard(gameBoard:PIXI.Container, boardLayout:number[][], squareSize:number):PIXI.Container {
  clearContainer(gameBoard)
  const rows = boardLayout.length
  const cols = boardLayout[0].length
  let even:boolean = false
  for(let row:number = 0 ; row < rows ; row++) {
    for(let col:number = 0 ; col < cols ; col++) {
      const boardPosition:PIXI.Point = new PIXI.Point(row, col)
      const square:PIXI.Graphics = createSquare(squareSize, even)
      square.position = boardPositionToPixels(boardLayout, squareSize, boardPosition)
      gameBoard.addChild(square)
      square.addChild(createArrow(squareSize, boardLayout[row][col]))
      even = !even
    }
    if(rows % 2 === 0)
      even = !even
  }
  return gameBoard
}

function createSquare(size:number, even:boolean):PIXI.Graphics {
  const square:PIXI.Graphics = new PIXI.Graphics()
  square.beginFill(even ? COLOR_EVEN : COLOR_ODD)
  square.drawRect(-size / 2, -size / 2, size, size)
  square.endFill()
  return square
}

function createArrow(size:number, direction:DIRECTION):PIXI.Graphics {
  const arrow:PIXI.Graphics = new PIXI.Graphics()
  arrow.beginFill(COLOR_ARROW)
  arrow.drawRect(-size / 12, -size * .2, size / 6, size * .6)
  arrow.drawPolygon([
    new PIXI.Point(0, -size * .4),
    new PIXI.Point(-size * .25, -size * .1),
    new PIXI.Point(size * .25, -size * .1)
  ])
  arrow.endFill()
  arrow.rotation = Math.PI / 2 * direction
  return arrow
}

function createChecker(size:number):PIXI.Graphics {
  const checker:PIXI.Graphics = new PIXI.Graphics()
  checker.alpha = .75
  checker.beginFill(COLOR_CHECKER)
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
  container.removeChildren()
}

function renderLoop(renderer:PIXI.WebGLRenderer, stage:PIXI.Container):void {
    requestAnimationFrame(() => renderLoop(renderer, stage))
    renderer.render(stage)
}
