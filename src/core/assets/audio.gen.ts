export type RawSfx = string;

export type RawSong = {
  _bpm: number;
  _tracks: string[][];
};

const data = /*GEN*/{ _sfx: { _kick: '(,,)0+*Q', _snare: ',9I(1+I;', _bass: '*..*P):2', _hihat: ',75(,*B+', _synth_one: ')DE(Z*K>' }, _songs: { _main: { _bpm: 134, _tracks: [['_kick', '(.........(.....(.........(.....'], ['_snare', '....(.......(.......(.......(...'], ['_bass', '(..(.(..(...(...(.......(...(.(.'], ['_hihat', '(((,,,((((.(((((((((((.(.((((,,,'], ['_synth_one', ',*(...(.,...,.....(,*.*.*.,*..,.']] } } }/*/GEN*/;

export type RawAudioData = typeof data;

export default data;
