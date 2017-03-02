import * as fs from 'fs'
import {beforeEach, describe, it} from 'mocha'
import * as assert from 'assert'
import {SoundManager} from '../../../src/components/ui/sound-manager'

describe('SoundManager', function() {

  //let soundManager:SoundManager
  let sounds:{[key:string]:string}

  beforeEach(function() {
    sounds = {
      'notReal': './sounds/move.mp3'
    }
    assert(fs.existsSync('./sounds/move.mp3'))
    //soundManager = new SoundManager(sounds)
  })

  //it('creates an Audio element for each sound passed to its constructor',
    //function() {
      //const inputKeys:string[] = Object.keys(sounds)
      //const audioKeys:string[] = Object.keys(soundManager['sounds'])
      //assert(inputKeys.length === audioKeys.length)
      //for(let key in inputKeys) {
        //assert(audioKeys.indexOf(key) > -1)
        //const path:string = inputKeys[key]
        //const audio:HTMLAudioElement = soundManager['sounds'][key]
        //assert(audio.src === path)
      //}
    //}
  //)

  //describe('#play()', function() {
    //it('plays the audio element of the key passed into it', function() {
      //soundManager.play('notReal')
      //assert(!soundManager['sounds']['notReal'].paused)
    //})
  //})
})
