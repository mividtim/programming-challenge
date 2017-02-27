import * as PIXI from 'pixi.js'
import * as assert from 'assert'
import {beforeEach, describe, it} from 'mocha'
import {Direction} from '../checkers/board-layout'
import {Arrow} from './arrow'

describe('Arrow', function() {
  const originalSize:number = 20
  const originalDirection:Direction = Direction.Right
  const originalColor:number = 0xffffff
  let arrow:Arrow
  beforeEach(function() {
    arrow = new Arrow(originalSize, originalDirection, originalColor)
  })
  function checkSize(arrow:Arrow, size:number):boolean {
    const bounds:PIXI.Rectangle = arrow.getLocalBounds()
    return bounds.width === size / 2 && bounds.height === size * .8
  }
  function checkRotation(arrow:Arrow, direction:Direction):boolean {
    return arrow.rotation === Math.PI / 2 * direction
  }
  describe('#constructor()', function() {
    it('draws an arrow at the proper size', function() {
      assert(checkSize(arrow, originalSize))
    })
    it('sets its rotation properly', function() {
      assert(checkRotation(arrow, originalDirection))
    })
  })
  describe('#redraw()', function() {
    it('resizes the arrow correctly', function() {
      const newSize:number = 10
      arrow.redraw(newSize)
      assert(checkSize(arrow, newSize))
    })
    it('changes its color correctly', function() {
      const newColor:number = 0x111111
      arrow.redraw(originalSize)
      assert(arrow['color'] === originalColor)
      arrow.redraw(originalSize, null)
      assert(arrow['color'] === originalColor)
      arrow.redraw(originalSize, 0x111111)
      assert(arrow['color'] === newColor)
    })
  })
  describe('#setDirection', function() {
    it('changes its direction correctly', function() {
      const newDirection:Direction = Direction.Left
      arrow.setDirection(newDirection)
      assert(checkRotation(arrow, newDirection))
    })
  })
})
