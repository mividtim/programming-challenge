export class Sounds {
  sounds = {}
  constructor(sounds) {
    for (let sound in sounds) {
      const audio = new Audio()
      audio.src = sounds[sound]
      audio.preload = 'true'
      this.sounds[sound] = audio
    }
  }
  play(soundName) {
    this.sounds[soundName].pause()
    this.sounds[soundName].currentTime = 0
    this.sounds[soundName].play()
  }
}
