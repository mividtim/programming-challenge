/*
import {beforeEach, describe, it} from 'mocha'
import * as assert from 'assert'
import {Visualization} from './visualization'
import {BoardLayout, BoardPosition, Direction} from './components/checkers/board-layout'

describe('Visualization', function() {

  let visualization:Visualization
  const upperLeft = new BoardPosition(0, 0)
  const circularLayout = [
    [Direction.Right, Direction.Down],
    [Direction.Up, Direction.Left]
  ]
  const nonCircularLayout = [
    [Direction.Right, Direction.Down],
    [Direction.Left, Direction.Left]
  ]

  beforeEach(function() {
    visualization = new Visualization([])
  })

  describe('#setBoardLayout', function() {
    it('sets the proper board size', function() {
      visualization.setBoardLayout(circularLayout)
      assert(visualization['board'].size === circularLayout.length)
    })
  })
})
*/
