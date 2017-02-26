/// <reference path='../typings/index.d.ts' />
import * as fs from 'fs'
import {Simulation, SimulationState} from './simulation'
import {BoardPosition} from './components/checkers/board-layout'
import {Visualization} from './visualization'

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))

class Application {

  private simulation:Simulation
  private visualization:Visualization
  private timeout:number

  public constructor() {
    // Number of rows and columns for the simulation board
    this.simulation = new Simulation(config.simulation.initialSize)
    // Called by the simulation whenever a point moves
    // (in order to animate it, perhaps)
    this.simulation.on('move', this.pointerMoved)
    this.simulation.on('end', this.simulationEnded)
    this.visualization = new Visualization(this.simulation.boardLayout)
    this.visualization.on('play', this.play)
    this.visualization.on('stop', this.forceStop)
    this.visualization.on('resize', this.resize)
    this.visualization.on('shuffle', this.shuffle)
    this.restart()
  }

  // Event handling callbacks need fat arrow to keep "this" context
  private resize = (amount:number):void => {
    this.stop()
    let boardSize:number = this.simulation.size + amount
    if(boardSize < 1)
      boardSize = 1
    else if(boardSize > config.simulation.maxSize)
      boardSize = config.simulation.maxSize
    if(this.simulation.size !== boardSize)
      this.simulation.resize(boardSize)
    this.visualization.setBoardLayout(this.simulation.boardLayout)
    this.restart()
    this.visualization.showMessage('Press Play to Begin')
  }

  // Event handling callbacks need fat arrow to keep "this" context
  private shuffle = ():void => {
    this.stop()
    this.simulation.shuffle()
    this.visualization.setBoardLayout(this.simulation.boardLayout)
    this.restart()
    this.visualization.showMessage('Press Play to Begin')
  }

  // Event handling callbacks need fat arrow to keep "this" context
  private play = ():void => {
    this.stop()
    this.restart()
    this.visualization.showMessage('Running')
    this.next()
  }

  // Event handling callbacks need fat arrow to keep "this" context
  private forceStop = ():void => {
    if(this.simulation.state === SimulationState.Running) {
      this.stop()
      this.visualization.showMessage('Stopped')
    }
  }

  // Event handling callbacks need fat arrow to keep "this" context
  private pointerMoved = (number:number, position:BoardPosition) => {
    this.visualization.moveChecker(number, position)
  }

  // Fat arrow to preserve "this" in setTimeout
  private next = ():void => {
    this.simulation.next()
    if(this.simulation.state === SimulationState.Running)
      // Delay for the animation to finish, and track the timeout so we
      // can stop it on demand
      this.timeout = setTimeout(this.next, config.visualization.moveTime)
  }

  // Event handling callbacks need fat arrow to keep "this" context
  private simulationEnded = ():void => {
    let message:string
    switch(this.simulation.state) {
      case SimulationState.Noncircular:
        this.visualization.showMessage('The path is noncircular.')
        this.visualization.fall()
        break
      case SimulationState.Circular:
        this.visualization.showMessage('The path is circular.')
        this.visualization.collide()
        break
    }
    this.timeout = setTimeout(this.stop, config.visualization.moveTime)
  }

  // Fat arrow to preserve "this" in setTimeout call
  private stop = () => {
    if(this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    this.visualization.stop()
  }

  private restart():void {
    // Move the checkers to their starting positions
    this.simulation.restart()
    this.visualization.restart()
    this.visualization.placeChecker(1, this.simulation.startingPosition)
    this.visualization.placeChecker(2, this.simulation.startingPosition)
  }
}

new Application()
