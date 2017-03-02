import * as PIXI from 'pixi.js'
import * as assert from 'assert'
import {beforeEach, describe, it} from 'mocha'
import {Checker} from '../../../src/components/checkers/checker'

describe('Checker', function() {
  const originalSize:number = 20
  let checker:Checker
  beforeEach(function() {
    checker = new Checker(originalSize)
  })
  function checkSize(checker:Checker, size:number):boolean {
    const bounds:PIXI.Rectangle = checker.getLocalBounds()
    return bounds.width === size && bounds.height === size
  }
  describe('#constructor()', function() {
    it('draws a checker at the proper size', function() {
      assert(checkSize(checker, originalSize))
    })
  })
  describe('#resize()', function() {
    it('redraws the checker to the given size', function() {
      const newSize:number = 10
      checker.resize(newSize)
      assert(checkSize(checker, newSize))
    })
  })
})
