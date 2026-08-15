export type RawSfx = string;

export type RawSong = {
  _bpm: number;
  _tracks: string[][];
};

const data = /*GEN*/{ _sfx: { _kick: '+28(0+05', _snare: '*4()/)>3', _bass: '*,(-@+,5', _beep: ')\\3**+64', _boop: '1C(#(162', _bang: '24(1N1.3', _laser: '3a( !1<4', _coin: '1N5%#1F3' }, _songs: { _main: { _bpm: 136, _tracks: [['_kick', '(.........*.....'], ['_snare', '....(.......,...'], ['_bass', '..(...,.........'], ['_beep', '(.*.(.(.(.*.*.(*']] } } }/*/GEN*/;

export type RawAudioData = typeof data;

export default data;
