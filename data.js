/* =====================================================================
   BUILD YOUR PLAYER – EDITABLE DATA FILE
   ---------------------------------------------------------------------
   Everything you may want to change lives here:
   texts, kit colours, positions & rating weights, badges, and players.
   Scores are fan-made placeholders (0-99) – change them as you like.
   ===================================================================== */

window.BUILDER_DATA = {

  /* ---------- General texts ---------- */
  siteTitle: "Build Your Bayern Player",
  clubName: "FC Bayern",
  siteUrl: "yourname.github.io",          // shown on the shared image
  disclaimer: "Fan-made for fun · Not affiliated with FC Bayern München",

  /* ---------- Game rules ---------- */
  optionsPerStep: 5,        // how many players to choose from at each step
  showScores: true,         // show each player's score on the choice buttons
  oneUsePerPlayer: true,    // each player can be used only once per build

  /* ---------- Kit & cartoon colours ---------- */
  kit: {
    shirt: "#dc052d",
    shirtShade: "#a8001f",
    trim: "#ffffff",
    shorts: "#c10023",
    socks: "#dc052d",
    sockBand: "#ffffff",
    boots: "#f4f4f4",
    bootSole: "#1f1f1f",
    skin: "#f0c4a2",   // default skin colour (a player can override with skin:"#...")
    hair: "#2a1c13",   // default hair colour (a player can override with hair:"#...")
    numberColor: "#ffffff"
  },

  /* ---------- Steps (order = order of the game) ----------
     key must stay the same (it is linked to a body part).
     You can change label and hint freely.                    */
  attributes: [
    { key: "leftFoot",  label: "Left foot",  hint: "Whose left foot do you want?" },
    { key: "rightFoot", label: "Right foot", hint: "Whose right foot do you want?" },
    { key: "pace",      label: "Pace",       hint: "Who gives your player the legs?" },
    { key: "shooting",  label: "Shooting",   hint: "Pick the finisher." },
    { key: "passing",   label: "Passing",    hint: "Who delivers the ball?" },
    { key: "vision",    label: "Vision",     hint: "Whose eyes see the pass first?" },
    { key: "dribbling", label: "Dribbling",  hint: "Who brings the magic on the ball?" },
    { key: "heading",   label: "Heading",    hint: "Who wins it in the air?" },
    { key: "defending", label: "Defending",  hint: "Who brings the steel?" },
    { key: "stamina",   label: "Stamina",    hint: "Who runs for 90+ minutes? (gives the shirt number)" },
    { key: "face",      label: "Face",       hint: "The final reveal: whose face?" }
  ],

  /* ---------- Positions & rating weights ----------
     Rating = weighted average of the chosen scores.
     Bigger weight = more important for that position.        */
  positions: [
    { id: "ST", label: "Striker",
      weights: { leftFoot: 1.5, rightFoot: 1.5, pace: 2, shooting: 3, passing: 1, vision: 1, dribbling: 1.5, heading: 2, defending: 0.5, stamina: 1 } },
    { id: "W", label: "Winger",
      weights: { leftFoot: 1.5, rightFoot: 1.5, pace: 3, shooting: 2, passing: 1.5, vision: 1, dribbling: 3, heading: 0.5, defending: 0.5, stamina: 1.5 } },
    { id: "AM", label: "Playmaker",
      weights: { leftFoot: 1.5, rightFoot: 1.5, pace: 1.5, shooting: 2, passing: 2.5, vision: 3, dribbling: 2.5, heading: 0.5, defending: 0.5, stamina: 1 } },
    { id: "CM", label: "Central midfielder",
      weights: { leftFoot: 1, rightFoot: 1, pace: 1, shooting: 1.5, passing: 3, vision: 3, dribbling: 1.5, heading: 1, defending: 2, stamina: 2.5 } },
    { id: "FB", label: "Full-back",
      weights: { leftFoot: 1.5, rightFoot: 1.5, pace: 2.5, shooting: 0.5, passing: 2, vision: 1, dribbling: 1.5, heading: 1, defending: 2.5, stamina: 3 } },
    { id: "CB", label: "Centre-back",
      weights: { leftFoot: 1, rightFoot: 1, pace: 1.5, shooting: 0.5, passing: 1.5, vision: 1, dribbling: 0.5, heading: 3, defending: 3.5, stamina: 2 } }
  ],

  /* Penalty if the two feet are very different (two-footed players are rarer) */
  weakFoot: [ { diff: 30, penalty: 2 }, { diff: 20, penalty: 1 } ],

  /* Text under the rating */
  tiers: [
    { min: 90, label: "Ballon d'Or material" },
    { min: 86, label: "World class" },
    { min: 82, label: "Bayern starter" },
    { min: 78, label: "Squad rotation" },
    { min: 0,  label: "Loan him out" }
  ],

  /* Badges: if at least `min` of the chosen players have the tag, bonus points */
  badges: [
    { tag: "treble2013", min: 5, label: "2013 Treble DNA", bonus: 1 },
    { tag: "treble2020", min: 4, label: "2020 Sextuple DNA", bonus: 1 },
    { tag: "academy",    min: 3, label: "Campus Kid", bonus: 1 }
  ],

  /* ---------- The two game modes ----------
     Each player:
       id      unique, no spaces
       name    full name (shown on buttons)
       short   name shown on the image (keep it short)
       number  shirt number
       photo   optional face picture, e.g. "faces/robben.png" (leave "" for cartoon face)
       tags    optional, used by badges
       stats   0-99
  */
  modes: {
    legend: {
      label: "Build your Legend",
      title: "LEGEND",
      subtitle: "Bayern legends of the 21st century",
      players: [
        { id: "robben",       name: "Arjen Robben",          short: "Robben",        number: 10, photo: "", tags: ["treble2013"],               stats: { leftFoot: 95, rightFoot: 62, pace: 92, shooting: 90, passing: 82, vision: 84, dribbling: 94, heading: 55, defending: 35, stamina: 75 } },
        { id: "ribery",       name: "Franck Ribéry",         short: "Ribéry",        number: 7,  photo: "", tags: ["treble2013"],               stats: { leftFoot: 72, rightFoot: 88, pace: 90, shooting: 80, passing: 87, vision: 88, dribbling: 95, heading: 45, defending: 40, stamina: 82 } },
        { id: "lewandowski",  name: "Robert Lewandowski",    short: "Lewandowski",   number: 9,  photo: "", tags: ["treble2020"],               stats: { leftFoot: 80, rightFoot: 95, pace: 80, shooting: 97, passing: 78, vision: 84, dribbling: 84, heading: 92, defending: 38, stamina: 85 } },
        { id: "muller",       name: "Thomas Müller",         short: "Müller",        number: 25, photo: "", tags: ["treble2013","treble2020","academy"], stats: { leftFoot: 70, rightFoot: 85, pace: 72, shooting: 84, passing: 86, vision: 95, dribbling: 76, heading: 75, defending: 55, stamina: 92 } },
        { id: "schweinsteiger", name: "Bastian Schweinsteiger", short: "Schweinsteiger", number: 31, photo: "", tags: ["treble2013","academy"], stats: { leftFoot: 75, rightFoot: 88, pace: 70, shooting: 82, passing: 91, vision: 90, dribbling: 80, heading: 72, defending: 80, stamina: 90 } },
        { id: "lahm",         name: "Philipp Lahm",          short: "Lahm",          number: 21, photo: "", tags: ["treble2013","academy"],     stats: { leftFoot: 82, rightFoot: 87, pace: 82, shooting: 62, passing: 88, vision: 90, dribbling: 82, heading: 55, defending: 90, stamina: 92 } },
        { id: "kroos",        name: "Toni Kroos",            short: "Kroos",         number: 39, photo: "", tags: [],                           stats: { leftFoot: 84, rightFoot: 92, pace: 60, shooting: 85, passing: 96, vision: 94, dribbling: 80, heading: 60, defending: 65, stamina: 82 } },
        { id: "alaba",        name: "David Alaba",           short: "Alaba",         number: 27, photo: "", tags: ["treble2013","treble2020"],  stats: { leftFoot: 90, rightFoot: 68, pace: 85, shooting: 78, passing: 85, vision: 82, dribbling: 80, heading: 70, defending: 87, stamina: 88 } },
        { id: "boateng",      name: "Jérôme Boateng",        short: "Boateng",       number: 17, photo: "", tags: ["treble2013","treble2020"],  stats: { leftFoot: 65, rightFoot: 82, pace: 82, shooting: 50, passing: 84, vision: 78, dribbling: 62, heading: 85, defending: 92, stamina: 82 } },
        { id: "martinez",     name: "Javi Martínez",         short: "Javi Martínez", number: 8,  photo: "", tags: ["treble2013","treble2020"],  stats: { leftFoot: 62, rightFoot: 80, pace: 65, shooting: 55, passing: 80, vision: 75, dribbling: 65, heading: 90, defending: 89, stamina: 85 } },
        { id: "thiago",       name: "Thiago Alcântara",      short: "Thiago",        number: 6,  photo: "", tags: ["treble2020"],               stats: { leftFoot: 75, rightFoot: 90, pace: 70, shooting: 72, passing: 93, vision: 93, dribbling: 93, heading: 50, defending: 72, stamina: 80 } },
        { id: "ballack",      name: "Michael Ballack",       short: "Ballack",       number: 13, photo: "", tags: [],                           stats: { leftFoot: 78, rightFoot: 86, pace: 72, shooting: 88, passing: 84, vision: 85, dribbling: 76, heading: 93, defending: 72, stamina: 88 } },
        { id: "elber",        name: "Giovane Élber",         short: "Élber",         number: 9,  photo: "", tags: [],                           stats: { leftFoot: 70, rightFoot: 85, pace: 80, shooting: 90, passing: 72, vision: 78, dribbling: 84, heading: 82, defending: 30, stamina: 78 } },
        { id: "pizarro",      name: "Claudio Pizarro",       short: "Pizarro",       number: 14, photo: "", tags: [],                           stats: { leftFoot: 72, rightFoot: 82, pace: 68, shooting: 86, passing: 75, vision: 80, dribbling: 78, heading: 90, defending: 35, stamina: 75 } },
        { id: "lucio",        name: "Lúcio",                 short: "Lúcio",         number: 3,  photo: "", tags: [],                           stats: { leftFoot: 62, rightFoot: 80, pace: 80, shooting: 60, passing: 70, vision: 68, dribbling: 72, heading: 88, defending: 91, stamina: 90 } },
        { id: "alonso",       name: "Xabi Alonso",           short: "Xabi Alonso",   number: 14, photo: "", tags: [],                           stats: { leftFoot: 70, rightFoot: 90, pace: 52, shooting: 80, passing: 95, vision: 94, dribbling: 72, heading: 70, defending: 80, stamina: 78 } },
        { id: "mandzukic",    name: "Mario Mandžukić",       short: "Mandžukić",     number: 9,  photo: "", tags: ["treble2013"],               stats: { leftFoot: 75, rightFoot: 82, pace: 72, shooting: 85, passing: 70, vision: 74, dribbling: 72, heading: 92, defending: 65, stamina: 92 } },
        { id: "coman",        name: "Kingsley Coman",        short: "Coman",         number: 11, photo: "", tags: ["treble2020"],               stats: { leftFoot: 75, rightFoot: 84, pace: 93, shooting: 78, passing: 80, vision: 80, dribbling: 90, heading: 50, defending: 40, stamina: 78 } },
        { id: "vidal",        name: "Arturo Vidal",          short: "Vidal",         number: 23, photo: "", tags: [],                           stats: { leftFoot: 70, rightFoot: 84, pace: 72, shooting: 82, passing: 82, vision: 80, dribbling: 76, heading: 75, defending: 86, stamina: 95 } },
        { id: "toni",         name: "Luca Toni",             short: "Toni",          number: 9,  photo: "", tags: [],                           stats: { leftFoot: 68, rightFoot: 84, pace: 62, shooting: 88, passing: 68, vision: 72, dribbling: 70, heading: 90, defending: 30, stamina: 70 } },
        { id: "scholl",       name: "Mehmet Scholl",         short: "Scholl",        number: 7,  photo: "", tags: ["academy"],                  stats: { leftFoot: 85, rightFoot: 80, pace: 74, shooting: 82, passing: 87, vision: 90, dribbling: 86, heading: 50, defending: 40, stamina: 70 } }
      ]
    },

    modern: {
      label: "Build your Modern player",
      title: "MODERN PLAYER",
      subtitle: "Today's Bayern squad",
      /* PLACEHOLDER SQUAD – check it against the current squad and edit */
      players: [
        { id: "kane",       name: "Harry Kane",         short: "Kane",       number: 9,  photo: "", tags: [],          stats: { leftFoot: 82, rightFoot: 95, pace: 70, shooting: 96, passing: 88, vision: 90, dribbling: 80, heading: 88, defending: 45, stamina: 82 } },
        { id: "musiala",    name: "Jamal Musiala",      short: "Musiala",    number: 10, photo: "", tags: ["academy"], stats: { leftFoot: 84, rightFoot: 88, pace: 85, shooting: 84, passing: 84, vision: 88, dribbling: 96, heading: 55, defending: 45, stamina: 80 } },
        { id: "olise",      name: "Michael Olise",      short: "Olise",      number: 17, photo: "", tags: [],          stats: { leftFoot: 92, rightFoot: 65, pace: 85, shooting: 84, passing: 89, vision: 91, dribbling: 91, heading: 45, defending: 40, stamina: 80 } },
        { id: "diaz",       name: "Luis Díaz",          short: "Díaz",       number: 14, photo: "", tags: [],          stats: { leftFoot: 78, rightFoot: 86, pace: 91, shooting: 84, passing: 80, vision: 80, dribbling: 90, heading: 60, defending: 50, stamina: 88 } },
        { id: "kimmich",    name: "Joshua Kimmich",     short: "Kimmich",    number: 6,  photo: "", tags: [],          stats: { leftFoot: 72, rightFoot: 91, pace: 70, shooting: 74, passing: 93, vision: 92, dribbling: 80, heading: 62, defending: 82, stamina: 92 } },
        { id: "goretzka",   name: "Leon Goretzka",      short: "Goretzka",   number: 8,  photo: "", tags: [],          stats: { leftFoot: 72, rightFoot: 84, pace: 74, shooting: 82, passing: 82, vision: 80, dribbling: 76, heading: 82, defending: 80, stamina: 88 } },
        { id: "pavlovic",   name: "Aleksandar Pavlović", short: "Pavlović",  number: 45, photo: "", tags: ["academy"], stats: { leftFoot: 86, rightFoot: 70, pace: 66, shooting: 70, passing: 86, vision: 84, dribbling: 80, heading: 68, defending: 80, stamina: 84 } },
        { id: "upamecano",  name: "Dayot Upamecano",    short: "Upamecano",  number: 2,  photo: "", tags: [],          stats: { leftFoot: 66, rightFoot: 80, pace: 84, shooting: 50, passing: 78, vision: 70, dribbling: 68, heading: 82, defending: 87, stamina: 82 } },
        { id: "tah",        name: "Jonathan Tah",       short: "Tah",        number: 4,  photo: "", tags: [],          stats: { leftFoot: 64, rightFoot: 80, pace: 74, shooting: 52, passing: 80, vision: 72, dribbling: 62, heading: 88, defending: 87, stamina: 80 } },
        { id: "kim",        name: "Kim Min-jae",        short: "Kim",        number: 3,  photo: "", tags: [],          stats: { leftFoot: 66, rightFoot: 80, pace: 82, shooting: 50, passing: 76, vision: 70, dribbling: 64, heading: 87, defending: 86, stamina: 86 } },
        { id: "davies",     name: "Alphonso Davies",    short: "Davies",     number: 19, photo: "", tags: [],          stats: { leftFoot: 84, rightFoot: 66, pace: 96, shooting: 66, passing: 78, vision: 74, dribbling: 86, heading: 50, defending: 78, stamina: 86 } },
        { id: "laimer",     name: "Konrad Laimer",      short: "Laimer",     number: 27, photo: "", tags: [],          stats: { leftFoot: 70, rightFoot: 80, pace: 82, shooting: 70, passing: 78, vision: 74, dribbling: 76, heading: 66, defending: 82, stamina: 95 } },
        { id: "gnabry",     name: "Serge Gnabry",       short: "Gnabry",     number: 7,  photo: "", tags: [],          stats: { leftFoot: 72, rightFoot: 86, pace: 86, shooting: 85, passing: 80, vision: 80, dribbling: 85, heading: 55, defending: 45, stamina: 78 } },
        { id: "stanisic",   name: "Josip Stanišić",     short: "Stanišić",   number: 44, photo: "", tags: ["academy"], stats: { leftFoot: 72, rightFoot: 80, pace: 76, shooting: 60, passing: 77, vision: 72, dribbling: 72, heading: 75, defending: 82, stamina: 84 } },
        { id: "karl",       name: "Lennart Karl",       short: "Karl",       number: 42, photo: "", tags: ["academy"], stats: { leftFoot: 86, rightFoot: 66, pace: 82, shooting: 80, passing: 80, vision: 84, dribbling: 86, heading: 45, defending: 40, stamina: 76 } },
        { id: "ito",        name: "Hiroki Ito",         short: "Ito",        number: 21, photo: "", tags: [],          stats: { leftFoot: 84, rightFoot: 64, pace: 70, shooting: 55, passing: 80, vision: 74, dribbling: 66, heading: 80, defending: 83, stamina: 80 } },
        { id: "bischof",    name: "Tom Bischof",        short: "Bischof",    number: 20, photo: "", tags: [],          stats: { leftFoot: 80, rightFoot: 74, pace: 74, shooting: 72, passing: 82, vision: 82, dribbling: 78, heading: 55, defending: 68, stamina: 82 } }
      ]
    }
  }
};
