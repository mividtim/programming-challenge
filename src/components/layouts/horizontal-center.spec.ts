import * as PIXI from 'pixi.js'
import * as assert from 'assert'
import {beforeEach, describe, it} from 'mocha'
import {HorizontalCenter} from './horizontal-center'

describe('HorizontalCenter', function() {
  let layout:HorizontalCenter
  const originalMargin:number = 10
  const childWidth:number = 20
  beforeEach(function() {
    layout = new HorizontalCenter(originalMargin)
  })
  function createChild():PIXI.Graphics {
    const child = new PIXI.Graphics()
    child.drawRect(-childWidth / 2, 0, childWidth, 1)
    return child
  }
  function checkCentered(layout:HorizontalCenter):boolean {
    const bounds:PIXI.Rectangle = layout.getLocalBounds()
    return bounds.x === -bounds.width / 2
  }
  describe('#contructor()', function() {
    it('keeps track of the margin passed to it', function() {
      assert(layout['margin'] === originalMargin)
    })
  })
  describe('#onChildrenChange()', function() {
    it('centers the children', function() {
      layout.addChild(createChild())
      assert(checkCentered(layout))
      layout.addChild(createChild())
      assert(checkCentered(layout))
    })
    it('adds margin between children', function() {
      layout.addChild(createChild())
      assert(layout.getLocalBounds().width === childWidth)
      layout.addChild(createChild())
      assert(layout.getLocalBounds().width === childWidth * 2 + originalMargin)
    })
  })
  describe('#setMargin()', function() {
    it('changes margin between children by the correct amount', function() {
      const newMargin:number = 20
      layout.addChild(createChild())
      layout.addChild(createChild())
      layout.setMargin(newMargin)
      assert(layout.getLocalBounds().width === childWidth * 2 + newMargin)
      layout.addChild(createChild())
      assert(layout.getLocalBounds().width === childWidth * 3 + newMargin * 2)
    })
    it('keeps the children centered', function() {
      layout.addChild(createChild())
      layout.addChild(createChild())
      layout.setMargin(20)
      assert(checkCentered(layout))
    })
  })
})
