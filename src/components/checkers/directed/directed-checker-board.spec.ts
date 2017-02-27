import * as PIXI from 'pixi.js'
import * as assert from 'assert'
import {beforeEach, describe, it} from 'mocha'
import {BoardLayout, Direction} from '../board-layout'
import {DirectedCheckerBoard} from './directed-checker-board'
import {DirectedCheckerSquare} from './directed-checker-square'

describe('DirectedCheckerBoard', function() {
  const circularLayout:BoardLayout = [
    [Direction.Right, Direction.Down],
    [Direction.Up, Direction.Left]
  ]
  const noncircularLayout:BoardLayout = [
    [Direction.Right, Direction.Down],
    [Direction.Left, Direction.Left]
  ]
  let board:DirectedCheckerBoard
  beforeEach(function() {
    board = new DirectedCheckerBoard(circularLayout, 100)
  })
  function checkArrows(
    board:DirectedCheckerBoard,
    boardLayout:BoardLayout
  ):boolean {
    for(let row:number = 0 ; row < circularLayout.length ; row++)
      for(let col:number = 0 ; col < circularLayout[row].length ; col++) {
        const square:DirectedCheckerSquare = board['squares'][row][col]
        if(square['arrow']['direction'] !== boardLayout[row][col])
          return false
      }
    return true
  }
  describe('#constructor()', function() {
    it('sets the square directions properly', function() {
      assert(checkArrows(board, circularLayout))
    })
  })
  describe('#setBoardLayout()', function() {
    it('sets the square directions properly', function() {
      board.setBoardLayout(noncircularLayout)
      assert(checkArrows(board, noncircularLayout))
    })
  })
})
