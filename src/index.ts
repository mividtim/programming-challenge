/// <reference path='../typings/index.d.ts' />
import PIXI = require('pixi.js')
import TweenLite = require('gsap/TweenLite')
import {Sounds} from './sounds'

const SCREEN_WIDTH:number = 1280
const SCREEN_HEIGHT:number = 720
const INITIAL_SIZE:number = 20
const COLOR_BUTTON:number = 0x444411
const COLOR_EVEN:number = 0xee1111
const COLOR_ODD:number = 0x111111
const COLOR_ARROW:number = 0xeeeeee
const COLOR_CHECKER:number = 0x111111
const BUTTON_WIDTH:number = 150
const BUTTON_HEIGHT:number = 50

const enum DIRECTION {
  Up = 0,
  Right,
  Down,
  Left
}

class Visualization {
  checker1:PIXI.DisplayObject
  checker2:PIXI.DisplayObject
  boardLayout:number[][]
  startingPosition:PIXI.Point
  squareSize:number
  sounds:Sounds
  running:boolean
  timeout:number
  message:PIXI.Text
  constructor(checker1:PIXI.DisplayObject, checker2:PIXI.DisplayObject, boardLayout:number[][], startingPosition:PIXI.Point, squareSize:number, sounds:Sounds) {
    this.checker1 = checker1
    this.checker2 = checker2
    this.boardLayout = boardLayout
    this.startingPosition = startingPosition
    this.squareSize = squareSize
    this.sounds = sounds
    this.running = false
  }
}

(function():void {
  const sounds:Sounds = new Sounds({
    move: './sounds/move.mp3',
    collide: './sounds/collide.wav',
    fall: './sounds/fall.wav',
  })
  const renderer:PIXI.WebGLRenderer = new PIXI.WebGLRenderer(SCREEN_WIDTH, SCREEN_HEIGHT)
  document.body.appendChild(renderer.view)
  const stage:PIXI.Container = new PIXI.Container()
  renderLoop(renderer, stage)
  const visualizationBoard:PIXI.Container = new PIXI.Container()
  visualizationBoard.position = new PIXI.Point(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - BUTTON_HEIGHT / 2)
  stage.addChild(visualizationBoard)
  const visualization:Visualization = newVisualization(visualizationBoard, INITIAL_SIZE, sounds)
  createControls(stage, visualizationBoard, visualization)
})()

function createControls(stage:PIXI.Container, visualizationBoard:PIXI.Container, visualization:Visualization) {
  function changeSize(amount:number) {
    stop(visualization)
    let newSize:number = visualization.boardLayout.length + amount
    if(newSize < 1)
      newSize = 1
    // Keep track of the message text in the new visualization
    const message:PIXI.Text = visualization.message
    message.text = 'Press Play to Begin'
    visualization = newVisualization(visualizationBoard, newSize, visualization.sounds)
    visualization.message = message
  }
  stage.addChild(createButton(
    SCREEN_WIDTH / 2 - BUTTON_WIDTH * 1.5 - 60,
    SCREEN_HEIGHT - BUTTON_HEIGHT / 2 - 50,
    '-',
    () => changeSize(-1),
    true // small button
  ))
  stage.addChild(createButton(
    SCREEN_WIDTH / 2 - BUTTON_WIDTH * 2 - 80,
    SCREEN_HEIGHT - BUTTON_HEIGHT / 2 - 50,
    '+',
    () => changeSize(1),
    true // small button
  ))
  stage.addChild(createButton(
    SCREEN_WIDTH / 2 - BUTTON_WIDTH / 2 - 20,
    SCREEN_HEIGHT - BUTTON_HEIGHT / 2 - 50,
    'Shuffle',
    () => {
      stop(visualization)
      // Keep track of the message text in the new visualization
      const message:PIXI.Text = visualization.message
      message.text = 'Press Play to Begin'
      visualization = newVisualization(visualizationBoard, visualization.boardLayout.length, visualization.sounds)
      visualization.message = message
    }
  ))
  stage.addChild(createButton(
    SCREEN_WIDTH / 2 + BUTTON_WIDTH / 2 + 20,
    SCREEN_HEIGHT - BUTTON_HEIGHT / 2 - 50,
    'Play',
    () => { if(!visualization.running) play(visualization) }
  ))
  stage.addChild(createButton(
    SCREEN_WIDTH / 2 + BUTTON_WIDTH * 1.5 + 60,
    SCREEN_HEIGHT - BUTTON_HEIGHT / 2 - 50,
    'Stop',
    () => {
      if(visualization.running) {
        visualization.message.text = 'Stopped'
        stop(visualization)
      }
    }
  ))
  visualization.message = new PIXI.Text('Press Play to Begin', {
    fill: [0xcccccc, COLOR_BUTTON],
    stroke: 0xeeeeee,
    strokeThickness: 2
  })
  visualization.message.anchor.x = .5
  visualization.message.position = new PIXI.Point(SCREEN_WIDTH / 2, 20)
  stage.addChild(visualization.message)
}

function newVisualization(visualizationBoard:PIXI.Container, boardSize:number, sounds:Sounds):Visualization {
  const boardLayout:number[][] = newBoardLayout(boardSize)
  const squareSize:number = Math.min(SCREEN_WIDTH / boardSize, SCREEN_HEIGHT / boardSize) * .75
  createBoard(visualizationBoard, boardLayout, squareSize)
  const startingPosition:PIXI.Point = randomPosition(boardLayout)
  const checker1:PIXI.DisplayObject = createChecker(squareSize)
  visualizationBoard.addChild(checker1)
  checker1.position = boardPositionToPixels(boardLayout.length, squareSize, startingPosition)
  const checker2:PIXI.DisplayObject = createChecker(squareSize)
  visualizationBoard.addChild(checker2)
  checker2.position = boardPositionToPixels(boardLayout.length, squareSize, startingPosition)
  return new Visualization(checker1, checker2, boardLayout, startingPosition, squareSize, sounds)
}

function play(visualization:Visualization, checker1Position:PIXI.Point = null, checker2Position:PIXI.Point = null, evenMove:boolean = false):void {
  visualization.message.text = "Running"
  visualization.running = true
  if(!checker1Position) {
    checker1Position = new PIXI.Point(visualization.startingPosition.x, visualization.startingPosition.y)
    checker2Position = new PIXI.Point(visualization.startingPosition.x, visualization.startingPosition.y)
  }
  let endCondition:string
  checker1Position = moveChecker(visualization.checker1, checker1Position, visualization.boardLayout, visualization.squareSize)
  // Have to check before moving the second checker
  endCondition = testEndCondition(visualization.boardLayout, checker1Position, checker2Position)
  if(!endCondition && evenMove) {
    checker2Position = moveChecker(visualization.checker2, checker2Position, visualization.boardLayout, visualization.squareSize)
    endCondition = testEndCondition(visualization.boardLayout, checker1Position, checker2Position)
  }
  visualization.sounds.play('move')
  if(endCondition) {
    TweenLite.to(visualization.checker1.scale, .5, {x: 0, y: 0})
    visualization.message.text = endCondition
    visualization.sounds.play(endCondition.indexOf('non') < 0 ? 'collide' : 'fall')
    setTimeout(() => stop(visualization), 500)
  }
  else
    visualization.timeout = setTimeout(() => play(visualization, checker1Position, checker2Position, !evenMove), 500)
}

function stop(visualization:Visualization) {
  if(visualization.running) {
    if(visualization.timeout) {
      clearTimeout(visualization.timeout)
      visualization.timeout = null
    }
    const pixelPosition:PIXI.Point = boardPositionToPixels(visualization.boardLayout.length, visualization.squareSize, visualization.startingPosition)
    TweenLite.to(visualization.checker1.scale, .3, {x: 1, y: 1})
    TweenLite.to(visualization.checker1.position, .3, {x: pixelPosition.x, y: pixelPosition.y})
    TweenLite.to(visualization.checker2.position, .3, {x: pixelPosition.x, y: pixelPosition.y})
    visualization.running = false
  }
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
  const pixelPosition:PIXI.Point = boardPositionToPixels(boardLayout.length, squareSize, nextPosition)
  TweenLite.to(checker.position, .3, {x: pixelPosition.x, y: pixelPosition.y})
  return nextPosition
}

function testEndCondition(boardLayout:number[][], checker1Position:PIXI.Point, checker2Position:PIXI.Point):string {
  let endCondition:string
  if(!validPosition(boardLayout, checker1Position))
    endCondition = 'The path is noncircular.'
  else if(samePosition(checker1Position, checker2Position))
    endCondition = 'The path is circular.'
  return endCondition
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

function newBoardLayout(size:number):number[][] {
  const boardLayout:number[][] = []
  for(let row:number = 0 ; row < size ; row++) {
    boardLayout.push([])
    for(let col:number = 0 ; col < size ; col++) {
      const boardPosition:PIXI.Point = new PIXI.Point(row, col)
      const arrowDirection:DIRECTION = Math.floor(Math.random() * 4)
      boardLayout[row].push(arrowDirection)
    }
  }
  return boardLayout
}

function createBoard(visualizationBoard:PIXI.Container, boardLayout:number[][], squareSize:number):PIXI.Container {
  clearContainer(visualizationBoard)
  const size:number = boardLayout.length
  let even:boolean = false
  for(let row:number = 0 ; row < size ; row++) {
    for(let col:number = 0 ; col < size ; col++) {
      const boardPosition:PIXI.Point = new PIXI.Point(row, col)
      const square:PIXI.Graphics = createSquare(squareSize, even)
      square.position = boardPositionToPixels(boardLayout.length, squareSize, boardPosition)
      visualizationBoard.addChild(square)
      square.addChild(createArrow(squareSize, boardLayout[row][col]))
      even = !even
    }
    if(size % 2 === 0)
      even = !even
  }
  return visualizationBoard
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
  checker.lineStyle(2, 0xeeeeee)
  checker.beginFill(COLOR_CHECKER)
  checker.drawCircle(0, 0, size * .3)
  checker.endFill()
  return checker
}

function createButton(x:number, y:number, label:string, action, small:boolean = false):PIXI.Graphics {
  const button:PIXI.Graphics = new PIXI.Graphics()
  const width:number = small ? BUTTON_WIDTH / 2 : BUTTON_WIDTH
  button.position = new PIXI.Point(x - width / 2, y - BUTTON_HEIGHT / 2)
  button.lineStyle(2, 0xeeeeee)
  button.beginFill(COLOR_BUTTON)
  button.drawRect(0, 0, width, BUTTON_HEIGHT)
  button.endFill()
  const text:PIXI.Text = new PIXI.Text(label, {stroke: 0xeeeeee, fill: 0x111111, strokeThickness: 2, align: 'center', lineJoin: 'round'})
  text.position = new PIXI.Point(width / 2, BUTTON_HEIGHT / 2)
  text.anchor.x = .5
  text.anchor.y = .5
  button.addChild(text)
  button.interactive = true
  button.on('mouseup', action)
  button.on('touchend', action)
  return button
}

function boardPositionToPixels(boardSize:number, squareSize:number, boardPosition:PIXI.Point):PIXI.Point {
  return new PIXI.Point(
    (boardPosition.y - boardSize / 2) * squareSize,
    (boardPosition.x - boardSize / 2) * squareSize
  )
}

function randomPosition(boardLayout:number[][]):PIXI.Point {
  return new PIXI.Point(
      Math.floor(Math.random() * boardLayout.length),
      Math.floor(Math.random() * boardLayout.length)
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
