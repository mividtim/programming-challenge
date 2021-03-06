export class SoundManager {

  private sounds:{[key:string]:HTMLAudioElement} = {}

  public constructor(sounds:{[key:string]:string}) {
    for(let sound in sounds) {
      const audio = new Audio()
      audio.src = sounds[sound]
      audio.preload = 'true'
      this.sounds[sound] = audio
    }
  }

  public play(soundName) {
    this.sounds[soundName].pause()
    this.sounds[soundName].currentTime = 0
    this.sounds[soundName].play()
  }
}
