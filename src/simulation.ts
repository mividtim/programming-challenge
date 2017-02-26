import * as EventsEmitter from 'events'
import {
  BoardLayout,
  BoardPosition,
  Direction
} from './components/checkers/board-layout'

export const enum SimulationState {
  Running,
  Circular,
  Noncircular
}

export class Simulation extends EventsEmitter {

  size:number
  boardLayout:BoardLayout = []
  state:SimulationState
  startingPosition:BoardPosition
  pointerOnePosition:BoardPosition
  pointerTwoPosition:BoardPosition
  evenMove:boolean

  public constructor(size:number) {
    super()
    // Set initial board layout to the proper size; resize takes care of
    // shuffling
    this.resize(size)
  }

  // When the simulation is resized, resize the board layout data structure
  // and shuffle the board (an improvement could be to only randomize any "new"
  // positions)
  public resize(size:number):void {
    this.size = size
    // Remove rows down to the proper size
    while(this.boardLayout.length > size)
      this.boardLayout.pop()
    for(let row:number = 0 ; row < this.boardLayout.length ; row++) {
      // Remove columns from each remaining row down to the proper size
      while(this.boardLayout[row].length > size)
        this.boardLayout[row].pop()
      // Add columns to the existing rows up to the proper size
      while(size > this.boardLayout[row].length)
        this.boardLayout[row].push(0)
    }
    // Add rows up to the proper size
    while(size > this.boardLayout.length)
      this.addRow(this.boardLayout.length)
    this.shuffle()
  }

  // Set random values for each location on the board
  public shuffle():void {
    for(let row:number = 0 ; row < this.size ; row++)
      for(let col:number = 0 ; col < this.size ; col++)
        this.boardLayout[row][col] = Math.floor(Math.random() * 4)
    this.startingPosition = this.randomPosition()
    this.restart()
  }

  // Set the state to Running, and move the pointers back to starting position
  public restart():void {
    this.state = SimulationState.Running
    this.pointerOnePosition = this.startingPosition
    this.pointerTwoPosition = this.startingPosition
    this.evenMove = false
  }

  public run():void {
    this.restart()
    while(this.state === SimulationState.Running)
      this.next()
  }

  // The iterator, used by the controller to step through the simulation
  // An improvement might be to add a "run" method to Simulation, which
  // would run the entire simulation synchronously
  public next():void {
    this.pointerOnePosition = this.nextPosition(this.pointerOnePosition)
    this.determineState()
    this.emit('move', 1, this.pointerOnePosition)
    // Have to check before moving the second pointer
    if(this.state === SimulationState.Running && this.evenMove) {
      this.pointerTwoPosition = this.nextPosition(this.pointerTwoPosition)
      this.determineState()
      this.emit('move', 2, this.pointerTwoPosition)
    }
    this.evenMove = !this.evenMove
    if(this.state !== SimulationState.Running)
      this.emit('end', this.state)
  }

  public static samePosition(position1:BoardPosition, position2:BoardPosition) {
    return position1.row === position2.row && position1.col === position2.col
  }

  private addRow(row:number):void {
    this.boardLayout.push([])
    for(let col:number = 0 ; col < this.size ; col++)
      this.boardLayout[row].push(0)
  }

  private nextPosition(currentPosition:BoardPosition):BoardPosition {
    const direction:Direction =
      this.boardLayout[currentPosition.row][currentPosition.col]
    let nextPosition:BoardPosition
    switch(direction) {
      case Direction.Up:
        nextPosition =
          new BoardPosition(currentPosition.row - 1, currentPosition.col)
        break;
      case Direction.Down:
        nextPosition =
          new BoardPosition(currentPosition.row + 1, currentPosition.col)
        break;
      case Direction.Left:
        nextPosition =
          new BoardPosition(currentPosition.row, currentPosition.col - 1)
        break;
      case Direction.Right:
        nextPosition =
          new BoardPosition(currentPosition.row, currentPosition.col + 1)
        break;
    }
    return nextPosition
  }

  private determineState():void {
    this.state =
      !this.validPosition(this.pointerOnePosition)
        ? SimulationState.Noncircular
      : Simulation.samePosition(this.pointerOnePosition, this.pointerTwoPosition)
        ? SimulationState.Circular
      : SimulationState.Running
  }

  private validPosition(position:BoardPosition):boolean {
    return !(
      position.row < 0 ||
      position.row > this.size - 1 ||
      position.col < 0 ||
      position.col > this.size - 1
    )
  }

  private randomPosition(size:number = 0):BoardPosition {
    if(size < 1)
      size = this.size
    return new BoardPosition(
        Math.floor(Math.random() * size),
        Math.floor(Math.random() * size)
    )
  }
}
