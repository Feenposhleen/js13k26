export type DialogueSpeaker = 0 | 1;

export type DialogueLine = {
  _speaker: DialogueSpeaker;
  _text: string[];
  _duration?: number;
};

export type CutsceneData = {
  _lines: DialogueLine[];
  _music?: number;
};

export const cutscenes: Record<number, CutsceneData> = {
  // Intro before starting Level 1 (index 0)
  0: {
    _lines: [
      {
        _speaker: 1,
        _text: ["UNICOP! EMERGENCY!", "THOSE LEPRECHAUNS ARE AT IT AGAIN."],
      },
      {
        _speaker: 0,
        _text: ["HOW BAD IS IT?"],
      },
      {
        _speaker: 1,
        _text: ["GOLD OVERFLOWING AT RAINBOWS END.", "THE RAINBOW WORLD WILL COLLAPSE!"],
      },
      {
        _speaker: 0,
        _text: ["MY RAINBOZOOKA IS READY."],
      },
    ],
  },
  // Between Level 0 and Level 1
  1: {
    _lines: [
      {
        _speaker: 1,
        _text: ["EXCELLENT WORK UNICOP."],
      },
      {
        _speaker: 0,
        _text: ["JUST DOING MY DUTY SIR."],
      },
      {
        _speaker: 1,
        _text: ["ITS NOT OVER YET.", "THEY ARE TRYING TO DELIVER MORE."],
      },
      {
        _speaker: 0,
        _text: ["THEY CAN TRY."],
      },
    ],
  },
  // Between Level 1 and Level 2
  2: {
    _lines: [
      {
        _speaker: 0,
        _text: ["THAT WAS A LOT."],
      },
      {
        _speaker: 1,
        _text: ["DONT CELEBRATE JUST YET."],
      },
      {
        _speaker: 0,
        _text: ["MORE HUH?"],
      },
      {
        _speaker: 1,
        _text: ["INDEED. AND THEY HAVE", "FOUND A WAY TO BLOCK COLORS!"],
      },
      {
        _speaker: 0,
        _text: ["DAMN LEPRECHAUNS."],
      },
      {
        _speaker: 0,
        _text: ["LETS GET THIS CLOVER WITH."],
      },
    ],
  },
  // Between Level 2 and Level 3
  3: {
    _lines: [
      {
        _speaker: 1,
        _text: ["GREAT JOB.", "YOU MANAGED TO FIND THEIR WEAKNESS."],
      },
      {
        _speaker: 0,
        _text: ["YEAH."],
      },
      {
        _speaker: 0,
        _text: ["GETTING SHOT."],
      },
      {
        _speaker: 1,
        _text: [
          "INDEED. NOW WE NEED YOU TO HOLD OFF",
          "THEIR SHIPMENTS WHILE WE TRACK THEIR LEADER",
        ],
      },
      {
        _speaker: 0,
        _text: ["I GUESS SOMEONE HAS TO DO IT."],
      },
    ],
  },
  // Between Level 3 and Level 4
  4: {
    _lines: [
      {
        _speaker: 1,
        _text: ["WE FOUND THEIR LEADER.", "HE IS LEADING A HUGE SHIPMENT."],
      },
      {
        _speaker: 0,
        _text: ["TIME TO FINISH THIS ONCE", "AND FOR ALL."],
      },
      {
        _speaker: 1,
        _text: ["THE WHOLE GALAXY IS", "WATCHING YOU UNICOP."],
      },
      {
        _speaker: 1,
        _text: ["OR AT LEAST THIS LITTLE PART OF IT."],
      },
      {
        _speaker: 0,
        _text: ["THANKS. NO PRESSURE."],
      },
      {
        _speaker: 1,
        _text: ["YOU COY BASTARD!", "SHOW NO MERCY!"],
      },
    ],
  },
  // Victory cutscene (after completing Level 4)
  5: {
    _lines: [
      {
        _speaker: 0,
        _text: ["TARGET DESTROYED."],
      },
      {
        _speaker: 1,
        _text: ["OUTSTANDING BRAVERY UNICOP!", "YOU ARE A TRUE HERO."],
      },
      {
        _speaker: 0,
        _text: ["JUST ANOTHER SUNDAY."],
      },
      {
        _speaker: 1,
        _text: ["RETURN TO STATION FOR MEDALS AND RAINBOW BREW!", "THAT IS AN ORDER!"],
      },
      {
        _speaker: 0,
        _text: ["UNICOP SIGNING OFF!"],
      },
    ],
  },
};

export const defaultCutscene: CutsceneData = {
  _lines: [
    {
      _speaker: 1,
      _text: ["GREAT SHOOTING UNICOP!", "SECTOR CLEARED."],
    },
    {
      _speaker: 0,
      _text: ["ADVANCING TO NEXT COORDINATES."],
    },
    {
      _speaker: 1,
      _text: ["STAY VIGILANT.", "ENEMIES INCOMING!"],
    },
  ],
};

export const getCutsceneForLevel = (levelNr: number): CutsceneData | null => {
  return cutscenes[levelNr] || (levelNr >= 0 ? defaultCutscene : null);
};
