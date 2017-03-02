import * as PIXI from 'pixi.js'
import * as assert from 'assert'
import {beforeEach, describe, it} from 'mocha'
import {BoardPosition} from '../../../src/components/checkers/board-layout'
import {CheckerSquare} from '../../../src/components/checkers/checker-square'

describe('CheckerBoard', function() {
  const originalSize:number = 10
  const originalEven = true
  let square:CheckerSquare
  beforeEach(function() {
    square = new CheckerSquare(
      new BoardPosition(0, 0),
      originalSize,
      originalEven
    )
  })
  function checkSize(square:CheckerSquare, size:number):boolean {
    const bounds:PIXI.Rectangle = square.getLocalBounds()
    return bounds.width === size && bounds.height === size
  }
  describe('#contructor()', function() {
    it('draws itself at the proper size', function() {
      assert(checkSize(square, originalSize))
    })
  })
  describe('#reset()', function() {
    it('resizes itself properly', function() {
      const newSize:number = 20
      square.reset(newSize, square['even'])
      assert(checkSize(square, newSize))
    })
    it('changes color properly', function() {
      square.reset(square['pixelSize'], !originalEven)
      assert(square['even'] === !originalEven)
    })
  })
})
