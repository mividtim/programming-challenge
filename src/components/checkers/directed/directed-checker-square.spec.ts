import * as PIXI from 'pixi.js'
import * as assert from 'assert'
import {beforeEach, describe, it} from 'mocha'
import {BoardPosition, Direction} from '../board-layout'
import {DirectedCheckerSquare} from './directed-checker-square'

describe('DirectedCheckerSquare', function() {
  const originalDirection = Direction.Right
  let square:DirectedCheckerSquare
  beforeEach(function() {
    square = new DirectedCheckerSquare(
      new BoardPosition(0, 0),
      100,
      false,
      0xffffff,
      0x000000,
      originalDirection
    )
  })
  function checkArrow(
    square:DirectedCheckerSquare,
    direction:Direction
  ):boolean {
    return square['arrow']['direction'] === direction
  }
  describe('#constructor()', function() {
    it('adds an arrow to itself', function() {
      assert(square.children.length === 1)
      assert(typeof square.children[0] === 'object')
      assert(square.children[0] === square['arrow'])
      assert(square.children[0].hasOwnProperty('direction'))
    })
    it('sets the square directions properly', function() {
      assert(checkArrow(square, originalDirection))
    })
  })
  describe('#reset()', function() {
    it('resizes the arrow properly', function() {
      square.reset(200, false)
      assert(square['arrow'].getLocalBounds().height === 200 * .8)
    })
  })
  describe('#setDirection', function() {
    it('changes the arrow direction properly', function() {
      const newDirection:Direction = Direction.Left
      square.setDirection(newDirection)
      assert(square['arrow']['direction'] === newDirection)
    })
  })
})
