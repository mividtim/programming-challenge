/// <reference path='../typings/index.d.ts' />
import * as fs from 'fs'
import {Simulation} from './simulation'
import {Position, SimulationState} from './types'
import {Visualization} from './visualization'

(function() {

  const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))

  class Controller {

    private simulation:Simulation
    private visualization:Visualization
    private timeout:number

    public constructor() {
      this.simulation = new Simulation(
        // Number of rows and columns for the simulation board
        config.simulation.initialSize,
        // Starting position for the pointers
        this.randomPosition(config.simulation.initialSize),
        // Called by the simulation whenever a point moves
        // (in order to animate it, perhaps)
        this.pointerMoved
      )
      this.visualization = new Visualization(
        this.simulation,
        // Event handlers for the buttons
        this.play,
        this.forceStop,
        this.resize,
        this.shuffle
      )
    }

    // Event handling callbacks need fat arrow to keep "this" context
    private resize = (amount:number):void => {
      this.stop()
      let boardSize:number = this.simulation.size + amount
      if(boardSize < 1)
        boardSize = 1
      else if(boardSize > config.simulation.maxSize)
        boardSize = config.simulation.maxSize
      if(this.simulation.size !== boardSize) {
        this.simulation.resize(boardSize, this.randomPosition(boardSize))
        this.visualization.refresh()
      }
      this.visualization.restart()
      this.visualization.showMessage('Press Play to Begin')
    }

    // Event handling callbacks need fat arrow to keep "this" context
    private shuffle = ():void => {
      this.stop()
      this.simulation.shuffle(this.randomPosition())
      this.visualization.refresh()
      this.visualization.restart()
      this.visualization.showMessage('Press Play to Begin')
    }

    // Event handling callbacks need fat arrow to keep "this" context
    private play = ():void => {
      this.stop()
      this.visualization.showMessage('Running')
      this.next()
    }

    // Event handling callbacks need fat arrow to keep "this" context
    private forceStop = ():void => {
      this.stop()
      this.visualization.showMessage('Stopped')
    }

    // Event handling callbacks need fat arrow to keep "this" context
    private pointerMoved = (number:number, position:Position) => {
      this.visualization.moveChecker(number, position)
    }

    // Fat arrow to preserve "this" in setTimeout
    private next = ():void => {
      this.simulation.next()
      if(this.simulation.state === SimulationState.Running)
        // Delay for the animation to finish, and track the timeout so we
        // can stop it on demand
        this.timeout = setTimeout(this.next, config.visualization.moveTime)
      else
        this.simulationEnded()
    }

    private simulationEnded():void {
      let message:string
      switch(this.simulation.state) {
        case SimulationState.Noncircular:
          message = 'The path is noncircular.'
          break
        case SimulationState.Circular:
          message = 'The path is circular.'
          break
      }
      this.visualization.endVisualization(this.simulation.state)
      this.visualization.showMessage(message)
      this.timeout = setTimeout(this.stop, config.visualization.moveTime)
    }

    // Fat arrow to preserve "this" in setTimeout call
    private stop = () => {
      if(this.timeout) {
        clearTimeout(this.timeout)
        this.timeout = null
      }
      this.simulation.restart()
      this.visualization.restart()
    }

    private randomPosition(size:number = 0):Position {
      if(size < 1)
        size = this.simulation.size
      return new Position(
          Math.floor(Math.random() * size),
          Math.floor(Math.random() * size)
      )
    }
  }

  new Controller()

})()
