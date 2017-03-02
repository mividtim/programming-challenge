import * as PIXI from 'pixi.js'
import * as assert from 'assert'
import {beforeEach, describe, it} from 'mocha'
import {BoardPosition} from '../../../src/components/checkers/board-layout'
import {CheckerBoard} from '../../../src/components/checkers/checker-board'
import {CheckerSquare} from '../../../src/components/checkers/checker-square'

describe('CheckerBoard', function() {
  const originalSize:number = 4
  const pixelSize:number = 100
  let board:CheckerBoard<CheckerSquare>
  beforeEach(function() {
    board = new CheckerBoard<CheckerSquare>(originalSize, pixelSize)
  })
  function checkBoardSize(
    board:CheckerBoard<CheckerSquare>,
    size:number
  ):boolean {
    return board['squares'].length === size
      && board['squares'][0].length === size
  }
  function addNewChild(board:CheckerBoard<CheckerSquare>):CheckerSquare {
    return board.addChild(
      new CheckerSquare(new BoardPosition(0, 0), board.squareSize, false)
    )
  }
  describe('#constructor()', function() {
    it('creates a checker board at the proper size', function() {
      assert(board.size === originalSize)
    })
    it('sets the proper square size', function() {
      assert(board.squareSize === pixelSize / originalSize)
    })
    it('creates the right amount of squares', function() {
      assert(checkBoardSize(board, originalSize))
    })
    it('staggers the square colors', function() {
      assert(!board['squares'][0][0]['even'])
      assert(board['squares'][0][1]['even'])
      assert(board['squares'][1][0]['even'])
      assert(!board['squares'][1][1]['even'])
    })
  })
  describe('#resize()', function() {
    it('increases the board size properly', function() {
      const newSize:number = 10
      board.resize(newSize)
      assert(checkBoardSize(board, newSize))
    })
    it('decreases the board size properly', function() {
      const newSize:number = 2
      board.resize(newSize)
      assert(checkBoardSize(board, newSize))
    })
    it('continues to stagger square colors properly on increase', function() {
      board.resize(5)
      assert(!board['squares'][3][3]['even'])
      assert(board['squares'][3][4]['even'])
      assert(board['squares'][4][3]['even'])
      assert(!board['squares'][4][4]['even'])
    })
  })
  describe('#toTop()', function() {
    it('moves a child to the top of the children', function() {
      const firstChild:CheckerSquare = addNewChild(board)
      const secondChild:CheckerSquare = addNewChild(board)
      assert(board.children[board.children.length - 1] === secondChild)
      board.toTop(firstChild)
      assert(board.children[board.children.length - 1] === firstChild)
    })
  })
  describe('#boardPositionToPixels()', function() {
    it('returns the center pixel position for a given board position',
      function() {
        const pixelPosition:PIXI.Point =
          board.boardPositionToPixels(new BoardPosition(1, 1))
        const halfSquareSize:number = board['squareSize'] / 2
        assert(pixelPosition.x === -halfSquareSize
          && pixelPosition.y === -halfSquareSize)
      }
    )
  })
})
