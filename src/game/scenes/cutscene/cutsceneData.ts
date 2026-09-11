export type DialogueSpeaker = "unicop" | "captain";

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
        _speaker: "captain",
        _text: ["UNICOP! EMERGENCY.", "LEPRECHAUNS CANNOT STOP HOARDING."],
      },
      {
        _speaker: "unicop",
        _text: ["HOW BAD IS IT SIR."],
      },
      {
        _speaker: "captain",
        _text: ["WAY TOO MUCH GOLD AT RAINBOWS END.", "THE RAINBOW WORLD WILL COLLAPSE!"],
      },
      {
        _speaker: "unicop",
        _text: ["I WILL SHOOT THEM DOWN.", "TIME TO SAVE THE RAINBOW!"],
      },
    ],
  },
  // Between Level 0 and Level 1
  1: {
    _lines: [
      {
        _speaker: "captain",
        _text: ["EXCELLENT WORK UNICOP.", "SECTOR 1 IS FULLY SECURED."],
      },
      {
        _speaker: "unicop",
        _text: ["JUST DOING MY DUTY SIR.", "ANY SIGN OF THE CRIMINALS."],
      },
      {
        _speaker: "captain",
        _text: ["RADAR DETECTS THEM IN SECTOR 2.", "THEY ARE HEAVILY ARMED."],
      },
      {
        _speaker: "unicop",
        _text: ["MY RAINBOW ZOOKA IS READY.", "JUSTICE WILL PREVAIL!"],
      },
      {
        _speaker: "captain",
        _text: ["MOVE OUT UNICOP.", "SHOW THEM NO MERCY!"],
      },
    ],
  },
  // Between Level 1 and Level 2
  2: {
    _lines: [
      {
        _speaker: "unicop",
        _text: ["SECTOR 2 HAS BEEN PURGED SIR."],
      },
      {
        _speaker: "captain",
        _text: ["DONT CELEBRATE JUST YET.", "A HEAVY FLIGHT IS INCOMING."],
      },
      {
        _speaker: "unicop",
        _text: ["THEY CANNOT OUTRUN", "THE LAW OF THE HORN."],
      },
      {
        _speaker: "captain",
        _text: ["WATCH YOUR FLANKS UNICOP.", "ENGAGE AT WILL!"],
      },
    ],
  },
  // Between Level 2 and Level 3
  3: {
    _lines: [
      {
        _speaker: "captain",
        _text: ["UNICOP. SENSORS ARE BLINKING.", "THEY ARE SCRAMBLING ALL UNITS."],
      },
      {
        _speaker: "unicop",
        _text: ["THEN IT IS A FAIR FIGHT.", "MY LASERS ARE FULLY CHARGED."],
      },
      {
        _speaker: "captain",
        _text: ["KEEP ROLLING AND", "USE RAPID FIRE!"],
      },
      {
        _speaker: "unicop",
        _text: ["FOR GLORY AND RAINBOWS SIR!"],
      },
    ],
  },
  // Between Level 3 and Level 4
  4: {
    _lines: [
      {
        _speaker: "captain",
        _text: ["THIS IS THEIR FINAL STAND.", "THE HEADQUARTERS IS AHEAD."],
      },
      {
        _speaker: "unicop",
        _text: ["TIME TO FINISH THIS ONCE", "AND FOR ALL."],
      },
      {
        _speaker: "captain",
        _text: ["THE WHOLE GALAXY IS", "WATCHING YOU UNICOP."],
      },
      {
        _speaker: "unicop",
        _text: ["I WILL NOT FAIL YOU SIR.", "CHARGING MAXIMUM POWER!"],
      },
      {
        _speaker: "captain",
        _text: ["DISMISS AND DESTROY!"],
      },
    ],
  },
  // Victory cutscene (after completing Level 4)
  5: {
    _lines: [
      {
        _speaker: "unicop",
        _text: ["ALL TARGETS ELIMINATED.", "THE GALAXY IS SAFE."],
      },
      {
        _speaker: "captain",
        _text: ["OUTSTANDING BRAVERY UNICOP!", "YOU ARE A TRUE HERO."],
      },
      {
        _speaker: "unicop",
        _text: ["ALL IN A DAYS PATROL SIR."],
      },
      {
        _speaker: "captain",
        _text: ["RETURN TO STATION FOR MEDALS", "AND RAINBOW DONUTS!"],
      },
      {
        _speaker: "unicop",
        _text: ["UNICOP SIGNING OFF!"],
      },
    ],
  },
};

export const defaultCutscene: CutsceneData = {
  _lines: [
    {
      _speaker: "captain",
      _text: ["GREAT SHOOTING UNICOP!", "SECTOR CLEARED."],
    },
    {
      _speaker: "unicop",
      _text: ["ADVANCING TO NEXT COORDINATES."],
    },
    {
      _speaker: "captain",
      _text: ["STAY VIGILANT.", "ENEMIES INCOMING!"],
    },
  ],
};

export const getCutsceneForLevel = (levelNr: number): CutsceneData | null => {
  return cutscenes[levelNr] || (levelNr >= 0 ? defaultCutscene : null);
};
