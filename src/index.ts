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
  checker:PIXI.DisplayObject
  boardLayout:number[][]
  checkerPosition:PIXI.Point
  squareSize:number
  constructor(checker:PIXI.DisplayObject, boardLayout:number[][], checkerPosition:PIXI.Point, squareSize:number) {
    this.checker = checker
    this.boardLayout = boardLayout
    this.checkerPosition = checkerPosition
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
  const checker:PIXI.DisplayObject = createChecker(squareSize)
  gameBoard.addChild(checker)
  const checkerPosition:PIXI.Point = randomPosition(boardLayout)
  checker.position = boardPositionToPixels(boardLayout, squareSize, checkerPosition)
  return new Game(checker, boardLayout, checkerPosition, squareSize)
}

function play(game:Game):void {
  const rows:number = game.boardLayout.length
  const cols:number = game.boardLayout[0].length
  const direction:DIRECTION = game.boardLayout[game.checkerPosition.x][game.checkerPosition.y]
  let nextPosition:PIXI.Point
  switch(direction) {
    case DIRECTION.Up:
      game.checkerPosition = new PIXI.Point(game.checkerPosition.x - 1, game.checkerPosition.y)
      break;
    case DIRECTION.Down:
      game.checkerPosition = new PIXI.Point(game.checkerPosition.x + 1, game.checkerPosition.y)
      break;
    case DIRECTION.Left:
      game.checkerPosition = new PIXI.Point(game.checkerPosition.x, game.checkerPosition.y - 1)
      break;
    case DIRECTION.Right:
      game.checkerPosition = new PIXI.Point(game.checkerPosition.x, game.checkerPosition.y + 1)
      break;
  }
  const pixelPosition:PIXI.Point = boardPositionToPixels(game.boardLayout, game.squareSize, game.checkerPosition)
  TweenLite.to(game.checker.position, .3, {x: pixelPosition.x, y: pixelPosition.y})
  if(game.checkerPosition.x < 0 || game.checkerPosition.x > rows - 1 || game.checkerPosition.y < 0 || game.checkerPosition.y > cols - 1) {
    console.log("Fell off the board!", game.checkerPosition.x, game.checkerPosition.y)
    setTimeout(() => TweenLite.to(game.checker.scale, .5, {x: 0, y: 0}), 500)
  }
  else {
    game.checker.scale = new PIXI.Point(1, 1)
    setTimeout(() => play(game), 500)
  }
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
