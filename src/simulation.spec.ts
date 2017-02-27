import {beforeEach, describe, it} from 'mocha'
import * as assert from 'assert'
import {Simulation, SimulationState} from './simulation'
import {BoardPosition, Direction} from './components/checkers/board-layout'

describe('Simulation', function() {

  let simulation:Simulation
  let path:BoardPosition[]
  let expectedMoves:number
  let expectedEndState:SimulationState

  beforeEach(function() {
    simulation = new Simulation(10)
    // Force the starting position to a known position
    simulation.startingPosition = new BoardPosition(0, 0)
    simulation.restart()
  })

  function setCircularLayout() {
    // > v
    // ^ <
    simulation.resize(2)
    simulation.boardLayout = [
      [Direction.Right, Direction.Down],
      [Direction.Up, Direction.Left]
    ]
    simulation.startingPosition = new BoardPosition(0, 0)
    simulation.restart()
    path = [
      simulation.startingPosition,
      new BoardPosition(0, 1),
      new BoardPosition(1, 1),
      new BoardPosition(1, 0),
      simulation.startingPosition,
      new BoardPosition(0, 1),
      new BoardPosition(1, 1)
    ]
    expectedMoves = 8
    expectedEndState = SimulationState.Circular
  }

  function setNoncircularLayout() {
    // > v
    // < <
    simulation.resize(2)
    simulation.boardLayout = [
      [Direction.Right, Direction.Down],
      [Direction.Left, Direction.Left]
    ]
    simulation.startingPosition = new BoardPosition(0, 0)
    simulation.restart()
    path = [
      simulation.startingPosition,
      new BoardPosition(0, 1),
      new BoardPosition(1, 1),
      new BoardPosition(1, 0)
    ]
    expectedMoves = 5
    expectedEndState = SimulationState.Noncircular
  }

  describe('#resize()', function() {
    it('changes the simulation size to the size passed', function() {
      assert(simulation.size === 10)
      simulation.resize(15)
      assert(simulation.size === 15)
      simulation.resize(5)
      assert(simulation.size === 5)
    })
    it('syncs size with length of layout in both dimensions', function() {
      assert(simulation.boardLayout.length === 10)
      for(let i:number = 0 ; i < simulation.boardLayout.length ; i++)
        assert(simulation.boardLayout[i].length === 10)
      simulation.resize(15)
      assert(simulation.boardLayout.length === 15)
      for(let i:number = 0 ; i < simulation.boardLayout.length ; i++)
        assert(simulation.boardLayout[i].length === 15)
      simulation.resize(5)
      assert(simulation.boardLayout.length === 5)
      for(let i:number = 0 ; i < simulation.boardLayout.length ; i++)
        assert(simulation.boardLayout[i].length === 5)
    })
  })

  describe('#samePosition', function() {
    it('checks that both the rows and the columns are the same', function() {
      const position1 = new BoardPosition(10, 15)
      const position2 = new BoardPosition(10, 15)
      assert(Simulation.samePosition(position1, position2))
      position2.row = 11
      assert(!Simulation.samePosition(position1, position2))
      position2.row = 10
      position2.col = 1
      assert(!Simulation.samePosition(position1, position2))
    })
  })

  describe('#restart()', function() {
    it('moves both pointers back to the starting position', function() {
      simulation.startingPosition = new BoardPosition(10, 10)
      simulation.restart()
      assert(Simulation.samePosition(
        simulation.pointerOnePosition,
        simulation.startingPosition
      ))
      assert(Simulation.samePosition(
        simulation.pointerTwoPosition,
        simulation.startingPosition
      ))
    })
  })

  describe('#next()', function() {
    it('calls the onmove callback', function() {
      let onmoveCalled:boolean = false
      simulation.on('move', () => onmoveCalled = true)
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
      simulation.run()
      assert(simulation.state === expectedEndState)
    })
    it('takes the proper number of moves for circular paths', function() {
      setCircularLayout()
      let takenMoves:number = 0
      simulation.on('move', () => takenMoves++)
      simulation.run()
      assert(takenMoves === expectedMoves)
    })
    it('ends in proper state for noncircular paths', function() {
      setNoncircularLayout()
      simulation.run()
      assert(simulation.state === expectedEndState)
    })
    it('takes the proper number of moves for noncircular paths', function() {
      setNoncircularLayout()
      let takenMoves:number = 0
      simulation.on('move', () => takenMoves++)
      simulation.run()
      assert(takenMoves === expectedMoves)
    })
  })
})
