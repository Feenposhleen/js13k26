export type RawSfx = string;

export type RawSong = {
  _bpm: number;
  _tracks: string[][];
};

const data = /*GEN*/{ _sfx: { _kick: '(,,)0+*Q', _snare: ',9I(1+I;', _bass: ')02(A)R@', _hihat: ',75(-*G*', _synth_one: ')FF(@*9(', _fire: '+</(;+44', _explosion: ',7(*G)CF' }, _songs: { _main: { _bpm: 134, _tracks: [['_kick', '(.........(.....(.......(.(.....'], ['_snare', '....(.......(.......(.......(...'], ['_bass', '*..*.*..,...,.......(...(...*.*.'], ['_hihat', '(((,,,,,,,.(((((((((((.(.((((,,,'], ['_synth_one', ',*(...(.,...,.(...(.*.*.*.,*..,.']] } } }/*/GEN*/;

export type RawAudioData = typeof data;

export default data;
