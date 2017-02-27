import * as PIXI from 'pixi.js'
import * as assert from 'assert'
import {beforeEach, describe, it} from 'mocha'
import {FullScreenHeaderFooter} from './full-screen-header-footer'

describe('FullScreenHeaderFooter', function() {
  const screenWidth = document.documentElement.clientWidth
  const screenHeight = document.documentElement.clientHeight
  const header = new PIXI.Graphics()
  header.drawRect(0, 0, 10, 10)
  const footer = new PIXI.Graphics()
  footer.drawRect(0, 0, 10, 10)
  const body = new PIXI.Container()
  describe('#constructor()', function() {
    it('is full-screen with no header or footer defined', function() {
      const layout:FullScreenHeaderFooter =
        new FullScreenHeaderFooter(body)
      assert(layout.bodyWidth === screenWidth)
      assert(layout.bodyHeight === screenHeight)
    })
    it('reduces its bodyHeight by header height', function() {
      const layout:FullScreenHeaderFooter =
        new FullScreenHeaderFooter(body, header)
      assert(layout.bodyHeight === screenHeight - 10)
    })
    it('also reduces its bodyHeight by footer height', function() {
      const layout:FullScreenHeaderFooter =
        new FullScreenHeaderFooter(body, header, footer)
      assert(layout.bodyHeight === screenHeight - 20)
    })
    it('decreases bodyHeight by eight times the margin passed', function() {
      const layout:FullScreenHeaderFooter =
        new FullScreenHeaderFooter(body, null, null, 10)
      assert(layout.bodyHeight === screenHeight - 80)
    })
  })
  describe('#addToBody', function() {
    it('adds the child to the body container', function() {
      const layout:FullScreenHeaderFooter = new FullScreenHeaderFooter(body)
      const newObject = new PIXI.Graphics()
      layout.addToBody(newObject)
      assert(body.children[0] === newObject)
    })
  })
})
