export const flipFlopCharacteristics = {
  sr: [
    { S: 0, R: 0, Q: "hold" }, { S: 0, R: 1, Q: 0 },
    { S: 1, R: 0, Q: 1 }, { S: 1, R: 1, Q: "invalid" }
  ],
  dff: [{ D: 0, Q: 0 }, { D: 1, Q: 1 }],
  jkff: [
    { J: 0, K: 0, Q: "hold" }, { J: 0, K: 1, Q: 0 },
    { J: 1, K: 0, Q: 1 }, { J: 1, K: 1, Q: "toggle" }
  ],
  tff: [{ T: 0, Q: "hold" }, { T: 1, Q: "toggle" }]
};

export function getFlipFlopTable(type) { return flipFlopCharacteristics[type] || []; }