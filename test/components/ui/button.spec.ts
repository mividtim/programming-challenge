import * as PIXI from 'pixi.js'
import * as assert from 'assert'
import {beforeEach, describe, it} from 'mocha'
import {Button, ButtonStyle} from '../../../src/components/ui/button'

describe('Button', function() {
  let button:Button
  const textStyle:PIXI.TextStyle = new PIXI.TextStyle({
    fontSize: 2
  })
  const width:number = 20
  const height:number = 10
  const style:ButtonStyle =
    new ButtonStyle(width, height, textStyle, 0xcccccc)
  beforeEach(function() {
    button = new Button('', style)
  })
  describe('#constructor()', function() {
    it('draws itself at the proper size', function() {
      const bounds:PIXI.Rectangle = button.getLocalBounds()
      assert(bounds.width === width)
      assert(bounds.height === height)
    })
    it('centers itself at its position', function() {
      const bounds:PIXI.Rectangle = button.getLocalBounds()
      assert(bounds.x === -width / 2)
      assert(bounds.y === -height / 2)
    })
  })
  it('calls the pressed event on mouseup', function() {
    let pressed:boolean = false
    button.on('pressed', () => pressed = true)
    assert(!pressed)
    button.emit('mouseup')
    assert(pressed)
  })
  it('calls the pressed event on touchend', function() {
    let pressed:boolean = false
    button.on('pressed', () => pressed = true)
    assert(!pressed)
    button.emit('touchend')
    assert(pressed)
  })
})
