import {beforeEach, describe, it} from 'mocha'
import * as assert from 'assert'
import {Simulation} from '../src/simulation'
import {SimulationState, Position, Direction} from '../src/types'

let simulation:Simulation
let onmoveCalled:boolean
let takenMoves:number
let path:Position[]
let expectedMoves:number
let expectedEndState:SimulationState

function onmove() {
  onmoveCalled = true
}

beforeEach(function() {
  onmoveCalled = false
  takenMoves = 0
  simulation = new Simulation(
    10,
    new Position(0, 0),
    onmove
  )
})

function setCircularLayout() {
  // > v
  // ^ <
  simulation.resize(2)
  simulation.layout = [
    [Direction.Right, Direction.Down],
    [Direction.Up, Direction.Left]
  ]
  path = [
    simulation.startingPosition,
    new Position(0, 1),
    new Position(1, 1),
    new Position(1, 0),
    simulation.startingPosition,
    new Position(0, 1),
    new Position(1, 1)
  ]
  expectedMoves = 6
  expectedEndState = SimulationState.Circular
}

function setNoncircularLayout() {
  // > v
  // < <
  simulation.resize(2)
  simulation.layout = [
    [Direction.Right, Direction.Down],
    [Direction.Left, Direction.Left]
  ]
  path = [
    simulation.startingPosition,
    new Position(0, 1),
    new Position(1, 1),
    new Position(1, 0)
  ]
  expectedMoves = 4
  expectedEndState = SimulationState.Noncircular
}

describe('Simulation', function() {
  describe('#resize()', function() {
    it('should change the simulation size to the size passed', function() {
      assert(simulation.size === 10)
      simulation.resize(15)
      assert(simulation.size === 15)
      simulation.resize(5)
      assert(simulation.size === 5)
    })
    it('should sync size with length of layout in both dimensions', function() {
      assert(simulation.layout.length === 10)
      for(let i:number = 0 ; i < simulation.layout.length ; i++)
        assert(simulation.layout[i].length === 10)
      simulation.resize(15)
      assert(simulation.layout.length === 15)
      for(let i:number = 0 ; i < simulation.layout.length ; i++)
        assert(simulation.layout[i].length === 15)
      simulation.resize(5)
      assert(simulation.layout.length === 5)
      for(let i:number = 0 ; i < simulation.layout.length ; i++)
        assert(simulation.layout[i].length === 5)
    })
  })
  describe('#samePosition', function() {
    it('should ensure both the rows and the columns are the same', function() {
      const position1 = new Position(10, 15)
      const position2 = new Position(10, 15)
      assert(Simulation.samePosition(position1, position2))
      position2.row = 11
      assert(!Simulation.samePosition(position1, position2))
      position2.row = 10
      position2.col = 1
      assert(!Simulation.samePosition(position1, position2))
    })
  })
  describe('#restart()', function() {
    it('should move both pointers back to the starting position', function() {
      simulation.startingPosition = new Position(10, 10)
      simulation.restart()
      assert(Simulation.samePosition(simulation.pointerOnePosition, simulation.startingPosition))
      assert(Simulation.samePosition(simulation.pointerTwoPosition, simulation.startingPosition))
    })
  })
  describe('#next()', function() {
    it('calls the onmove callback', function() {
      simulation.next()
      assert(onmoveCalled)
    })
    it('moves only pointer1 on odd moves, and both on even moves', function() {
      setCircularLayout()
      // First move is odd
      simulation.next()
      assert(Simulation.samePosition(simulation.pointerOnePosition, path[1]))
      assert(Simulation.samePosition(simulation.pointerTwoPosition, path[0]))
      // Second move is even
      simulation.next()
      assert(Simulation.samePosition(simulation.pointerOnePosition, path[2]))
      assert(Simulation.samePosition(simulation.pointerTwoPosition, path[1]))
      // Third move is odd
      simulation.next()
      assert(Simulation.samePosition(simulation.pointerOnePosition, path[3]))
      assert(Simulation.samePosition(simulation.pointerTwoPosition, path[1]))
      // Fourth move is even
      simulation.next()
      assert(Simulation.samePosition(simulation.pointerOnePosition, path[4]))
      assert(Simulation.samePosition(simulation.pointerTwoPosition, path[2]))
    })
    it('ends in proper state for circular paths', function() {
      setCircularLayout()
      while(simulation.state === SimulationState.Running) {
        simulation.next()
        takenMoves++
      }
      assert(simulation.state === expectedEndState)
      assert(takenMoves === expectedMoves)
    })
    it('ends in proper state for noncircular paths', function() {
      setNoncircularLayout()
      while(simulation.state === SimulationState.Running) {
        simulation.next()
        takenMoves++
      }
      assert(simulation.state === expectedEndState)
      assert(takenMoves === expectedMoves)
    })
  })
})
