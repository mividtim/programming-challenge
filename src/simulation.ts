import {Layout, Position, Direction, SimulationState} from './types'

export class Simulation {

  size:number
  layout:Layout = []
  startingPosition:Position
  state:SimulationState
  pointerOnePosition:Position
  pointerTwoPosition:Position
  evenMove:boolean
  onmove:(number,Position)=>void
  onend:(SimulationState)=>void

  public constructor(
    size:number,
    startingPosition:Position,
    onmove:(number,Position)=>void
  ) {
    // resize() will reset(), so set the starting position first
    this.startingPosition = startingPosition
    // Set initial layout to the proper size; resize takes care of shuffling
    this.resize(size)
    // Call the controller back whenever a pointer moves, in case we're
    // visualizing
    this.onmove = onmove
  }

  // When the simulation is resized, resize the layout data structure
  // and shuffle the board (an improvement could be to only randomize any "new"
  // positions)
  public resize(size:number, startingPosition:Position = null):void {
    this.size = size
    // Remove rows down to the proper size
    while(this.layout.length > size)
      this.layout.pop()
    for(let row = 0 ; row < this.layout.length ; row++) {
      // Remove columns from each remaining row down to the proper size
      while(this.layout[row].length > size)
        this.layout[row].pop()
      // Add columns to the existing rows up to the proper size
      while(size > this.layout[row].length)
        this.layout[row].push(0)
    }
    // Add rows up to the proper size
    while(size > this.layout.length)
      this.addRow(this.layout.length)
    this.shuffle(startingPosition)
  }

  // Set random values for each location on the board
  public shuffle(startingPosition:Position = null):void {
    for(let row:number = 0 ; row < this.size ; row++)
      for(let col:number = 0 ; col < this.size ; col++)
        this.layout[row][col] = Math.floor(Math.random() * 4)
    if(startingPosition !== null)
      this.startingPosition = startingPosition
    this.restart()
  }

  // Set the state to Running, and move the pointers back to starting position
  public restart():void {
    this.state = SimulationState.Running
    this.pointerOnePosition = this.startingPosition
    this.pointerTwoPosition = this.startingPosition
    this.evenMove = false
  }

  // The iterator, used by the controller to step through the simulation
  // An improvement might be to add a "run" method to Simulation, which
  // would run the entire simulation synchronously
  public next():void {
    this.onmove(
      1,
      this.pointerOnePosition = this.nextPosition(this.pointerOnePosition)
    )
    this.determineState()
    // Have to check before moving the second pointer
    if(this.state === SimulationState.Running && this.evenMove) {
      this.onmove(
        2,
        this.pointerTwoPosition = this.nextPosition(this.pointerTwoPosition)
      )
      this.determineState()
    }
    this.evenMove = !this.evenMove
  }

  public static samePosition(position1:Position, position2:Position) {
    return position1.row === position2.row && position1.col === position2.col
  }

  private addRow(row:number):void {
    this.layout.push([])
    for(let col:number = 0 ; col < this.size ; col++)
      this.layout[row].push(0)
  }

  private nextPosition(currentPosition:Position):Position {
    const direction:Direction =
      this.layout[currentPosition.row][currentPosition.col]
    let nextPosition:Position
    switch(direction) {
      case Direction.Up:
        nextPosition =
          new Position(currentPosition.row - 1, currentPosition.col)
        break;
      case Direction.Down:
        nextPosition =
          new Position(currentPosition.row + 1, currentPosition.col)
        break;
      case Direction.Left:
        nextPosition =
          new Position(currentPosition.row, currentPosition.col - 1)
        break;
      case Direction.Right:
        nextPosition =
          new Position(currentPosition.row, currentPosition.col + 1)
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

  private validPosition(position:Position):boolean {
    return !(
      position.row < 0 ||
      position.row > this.size - 1 ||
      position.col < 0 ||
      position.col > this.size - 1
    )
  }

}
