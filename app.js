const steps = [
  {
    short: "White cross",
    title: "Make a white cross",
    time: "ABOUT 5 MIN",
    description: "Find the four pieces with a white sticker and two colors. Put them around the white middle square. Match their other colors, too.",
    tasks: ["Find the four edge pieces with a white sticker.", "Match each piece’s other color to a middle square.", "Put the four white pieces around the white middle."],
    algorithm: null,
    tip: "The middle squares stay put. Use them as color guides for the pieces around them.",
    caption: "A white cross, with each edge lined up to its matching center.",
    pattern: ["empty", "white", "empty", "white", "white", "white", "empty", "white", "empty"],
    label: "White cross target pattern"
  },
  {
    short: "White corners",
    title: "Finish the white layer",
    time: "ABOUT 5 MIN",
    description: "Turn the white face to the bottom. Find a white corner piece and line it up above the spot with the same three colors. Repeat the moves until it fits.",
    tasks: ["Turn the white face to the bottom.", "Bring a white corner above its matching front-right spot.", "Repeat the moves until all four white corners fit."],
    algorithm: ["R", "U", "R′", "U′"],
    tip: "White corner in the wrong spot? Do the moves once to bring it back up, then try again.",
    caption: "The whole white face is done, and its side colors match their centers.",
    pattern: ["white", "white", "white", "white", "white", "white", "white", "white", "white"],
    label: "Completed white face"
  },
  {
    short: "Middle layer",
    title: "Fill the middle layer",
    time: "ABOUT 7 MIN",
    description: "Keep white on the bottom. Find a top piece with two colors and no yellow. Line up its front color, then move it into the gap on its left or right.",
    tasks: ["Find a top edge piece with no yellow.", "Turn the top until its front color matches.", "Move it into the left or right gap."],
    algorithm: ["U", "R", "U′", "R′", "U′", "F′", "U", "F"],
    alternate: ["U′", "L′", "U", "L", "U", "F", "U′", "F′"],
    alternateLabels: ["Right slot", "Left slot"],
    tip: "Gap on the right? Choose “Right slot.” Gap on the left? Choose “Left slot.”",
    caption: "Both bottom layers are solved. The yellow face stays on top.",
    pattern: ["blue", "orange", "red", "green", "green", "green", "green", "green", "green"],
    label: "Solved bottom layers with yellow on top"
  },
  {
    short: "Yellow cross",
    title: "Make a yellow cross",
    time: "ABOUT 3 MIN",
    description: "Keep yellow on top. Follow the moves to turn its four edge stickers upward. You may need to do the moves more than once.",
    tasks: ["Keep yellow on top.", "Notice whether you have a dot, L, or line.", "Repeat the move until a yellow cross appears."],
    algorithm: ["F", "R", "U", "R′", "U′", "F′"],
    tip: "Yellow line? Hold it sideways. Yellow L? Turn it so its arms point back and left. Just a dot? Do the moves and check again.",
    caption: "Only the four yellow edge pieces need to face up for this cross.",
    pattern: ["empty", "yellow", "empty", "yellow", "yellow", "yellow", "empty", "yellow", "empty"],
    label: "Yellow cross target pattern"
  },
  {
    short: "Yellow corners",
    title: "Turn yellow corners up",
    time: "ABOUT 5 MIN",
    description: "Keep yellow on top. Put a corner with yellow facing sideways in the front-right spot. Repeat the moves until yellow faces up.",
    tasks: ["Keep yellow facing up.", "Place a wrongly turned corner at the front-right.", "Repeat the move until yellow faces up; then turn only the top."],
    algorithm: ["R′", "D′", "R", "D"],
    tip: "After fixing a corner, turn only the top to bring over the next one. The cube may look mixed up for a moment. Keep going.",
    caption: "All four yellow corner stickers face up. Their side colors might not match yet.",
    pattern: ["yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow"],
    label: "Completed yellow face"
  },
  {
    short: "Place corners",
    title: "Put corners in place",
    time: "ABOUT 4 MIN",
    description: "Look at the three colors on each yellow corner. If one is above the spot with the same colors, turn only the top to bring it to the front-right. Follow the moves to place the others.",
    tasks: ["Find a yellow corner above its matching spot.", "Turn only the top to move it to the front-right.", "Repeat the moves until all four corners fit."],
    algorithm: ["U", "R", "U′", "L′", "U", "R′", "U′", "L"],
    tip: "No corner is in the right spot? Do the moves once, then check again.",
    caption: "Every yellow corner is in its correct spot. Next, line up the edges.",
    pattern: ["yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow"],
    label: "Yellow corners in their correct positions"
  },
  {
    short: "Place edges",
    title: "Line up the last edges",
    time: "ABOUT 4 MIN",
    description: "Keep yellow on top. Put an edge that matches its side color at the back. Choose the move that sends the other three edges in the right direction. Check and repeat if needed.",
    tasks: ["Find a top edge that matches its side color.", "Turn the top so this edge is at the back.", "Choose a direction and repeat until all sides match."],
    algorithm: ["R", "U′", "R", "U", "R", "U", "R", "U′", "R′", "U′", "R2"],
    alternate: ["R2", "U", "R", "U", "R′", "U′", "R′", "U′", "R′", "U", "R′"],
    alternateLabels: ["Cycle one way", "Cycle the other"],
    tip: "Not sure which way the other edges should go? Try either choice once, then look again.",
    caption: "Line up the last edges and your whole cube is solved. You did it!",
    pattern: ["yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow"],
    label: "Solved yellow face"
  }
];

const state = {
  current: 0,
  completedTasks: steps.map(() => new Set()),
  alternative: false,
  activeMove: -1,
  playbackTimer: null,
  isPlaying: false,
  soundEnabled: true,
  cubeX: -27,
  cubeY: -39,
  cubelets: [],
  cubeSpinAnimation: null,
  cubeTurnTimer: null,
  cubeTurnAnimation: null,
  cubeTurnActive: false,
  cubeMotionRunning: false,
  pointer: null
};

// Web Audio API Controller
class SoundController {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof AudioContext !== "undefined") {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTurn(pitch = 520) {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  playChime() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.08;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
      });
    } catch (e) {}
  }
}

const sound = new SoundController();

// DOM References
const nav = document.querySelector("#step-nav");
const moveLine = document.querySelector("#algorithm-line");
const playButton = document.querySelector("#play-button");
const nextButton = document.querySelector("#next-button");
const previousButton = document.querySelector("#prev-button");
const miniCube = document.querySelector("#mini-cube");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const cubeWrap = document.querySelector("#cube-wrap");
const cube3d = document.querySelector("#cube3d");
const cubeRotor = document.createElement("div");
cubeRotor.className = "cube-rotor";
const playIcon = document.querySelector("#play-icon");
const playLabel = document.querySelector("#play-label");
const cursorGlow = document.querySelector("#cursor-glow");
const bgParticles = document.querySelector("#bg-particles");

/* -------------------------------------------------------------------------
   Background Floating Particles & Cursor Glow
   ------------------------------------------------------------------------- */
function initBackground() {
  if (bgParticles) {
    const colors = ["var(--cube-green)", "var(--cube-blue)", "var(--cube-yellow)", "var(--cube-orange)", "var(--cube-red)"];
    for (let i = 0; i < 16; i++) {
      const cube = document.createElement("div");
      cube.className = "bg-float-cube";
      const size = 16 + Math.random() * 20;
      cube.style.width = `${size}px`;
      cube.style.height = `${size}px`;
      cube.style.left = `${Math.random() * 100}%`;
      cube.style.animationDuration = `${18 + Math.random() * 18}s`;
      cube.style.animationDelay = `${-Math.random() * 20}s`;
      cube.style.borderColor = colors[i % colors.length];
      cube.style.background = colors[i % colors.length];
      bgParticles.append(cube);
    }
  }

  window.addEventListener("pointermove", (e) => {
    if (cursorGlow) {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    }
  }, { passive: true });
}

/* -------------------------------------------------------------------------
   Theme Switcher & Sound Toggle
   ------------------------------------------------------------------------- */
function initThemeAndSound() {
  const themeButtons = document.querySelectorAll(".theme-btn");
  const savedTheme = localStorage.getItem("cubetheory_theme") || "sage";
  
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeButtons.forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.theme === theme);
    });
    localStorage.setItem("cubetheory_theme", theme);
  }

  applyTheme(savedTheme);

  themeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      applyTheme(btn.dataset.theme);
      sound.playTurn(600);
    });
  });

  const soundBtn = document.querySelector("#sound-toggle");
  const soundIcon = document.querySelector("#sound-icon");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      state.soundEnabled = !state.soundEnabled;
      soundIcon.textContent = state.soundEnabled ? "🔊" : "🔇";
      soundBtn.querySelector(".btn-text").textContent = state.soundEnabled ? "Sound" : "Muted";
      if (state.soundEnabled) sound.playTurn(700);
    });
  }
}

/* -------------------------------------------------------------------------
   Hero 3D Cube Initialization
   ------------------------------------------------------------------------- */
function makeHeroCube() {
  const faceColors = {
    "0,0,1": "var(--cube-red)",
    "0,0,-1": "var(--cube-blue)",
    "1,0,0": "var(--cube-orange)",
    "-1,0,0": "var(--cube-green)",
    "0,-1,0": "var(--cube-white)",
    "0,1,0": "var(--cube-yellow)"
  };
  const cubelets = [];
  const cubeletSize = 70;
  const spacing = cubeletSize;
  const faceClasses = {
    "0,0,1": "front",
    "0,0,-1": "back",
    "1,0,0": "right",
    "-1,0,0": "left",
    "0,-1,0": "top",
    "0,1,0": "bottom"
  };

  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        const cubelet = {
          position: { x, y, z },
          stickers: []
        };
        [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, -1, 0], [0, 1, 0]].forEach(normal => {
          const [nx, ny, nz] = normal;
          if ((nx && x === nx) || (ny && y === ny) || (nz && z === nz)) {
            cubelet.stickers.push({
              normal: { x: nx, y: ny, z: nz },
              color: faceColors[normal.join(",")]
            });
          }
        });

        const element = document.createElement("div");
        element.className = "cubelet";
        element.style.setProperty("--cubelet-size", `${cubeletSize}px`);
        cubelet.element = element;
        renderCubelet(cubelet, spacing, faceClasses);
        cubelets.push(cubelet);
      }
    }
  }

  cubeRotor.replaceChildren(...cubelets.map(cubelet => cubelet.element));
  cube3d.replaceChildren(cubeRotor);
  state.cubelets = cubelets;
}

function renderCubelet(cubelet, spacing, faceClasses) {
  const { x, y, z } = cubelet.position;
  cubelet.element.style.transform = `translate3d(${x * spacing}px, ${y * spacing}px, ${z * spacing}px)`;
  cubelet.element.replaceChildren(...cubelet.stickers.map(({ normal, color }) => {
    const sticker = document.createElement("span");
    sticker.className = `cube-sticker sticker-${faceClasses[`${normal.x},${normal.y},${normal.z}`]}`;
    sticker.style.setProperty("--sticker-color", color);
    return sticker;
  }));
}

function makeNav() {
  const fragment = document.createDocumentFragment();

  steps.forEach((step, index) => {
    const button = document.createElement("button");
    button.className = "step-nav-button";
    button.type = "button";
    button.dataset.index = String(index);
    button.setAttribute("aria-label", `Step ${index + 1}: ${step.short}`);
    button.innerHTML = `<span class="nav-number">${String(index + 1).padStart(2, "0")}</span><span class="nav-title">${step.short}</span><span class="nav-check" aria-hidden="true"></span>`;
    button.addEventListener("click", () => {
      sound.playTurn(550);
      renderStep(index);
    });
    fragment.append(button);
  });

  nav.replaceChildren(fragment);
}

function renderMoves(step) {
  moveLine.replaceChildren();
  const choices = document.querySelector("#algorithm-choices");
  choices.replaceChildren();
  const hint = document.querySelector(".algorithm-hint");
  hint.hidden = false;
  hint.textContent = step.algorithm ? "Tap play to see each move" : "Put white edges around white";
  playButton.hidden = !step.algorithm;
  document.querySelector(".notation-note").hidden = !step.algorithm;
  document.querySelector("#move-navigation").hidden = !step.algorithm;
  playLabel.textContent = "Play moves";
  playIcon.textContent = "▶";

  if (!step.algorithm) {
    const empty = document.createElement("span");
    empty.className = "algorithm-empty";
    empty.textContent = "No move pattern needed. Find the white pieces and put them around the white middle.";
    moveLine.replaceChildren(empty);
    moveLine.setAttribute("aria-label", "No move pattern needed. Find the white pieces and put them around the white middle.");
    renderActiveMove([]);
    return;
  }

  if (step.alternate) {
    const headingRight = document.querySelector(".algorithm-heading-right");
    const hint = headingRight.querySelector(".algorithm-hint");
    hint.hidden = true;
    step.alternateLabels.forEach((label, index) => {
      const choice = document.createElement("button");
      choice.className = "algorithm-choice";
      choice.type = "button";
      choice.textContent = label;
      choice.setAttribute("aria-pressed", String(state.alternative === (index === 1)));
      choice.addEventListener("click", () => {
        sound.playTurn(640);
        pausePlayback();
        state.alternative = index === 1;
        state.activeMove = -1;
        renderMoves(step);
      });
      choices.append(choice);
    });
  } else {
    document.querySelector(".algorithm-hint").hidden = false;
  }

  const algorithm = state.alternative && step.alternate ? step.alternate : step.algorithm;
  algorithm.forEach((move, index) => {
    const token = document.createElement("button");
    token.className = "move-token";
    token.type = "button";
    token.textContent = move;
    token.dataset.move = String(index);
    token.setAttribute("aria-label", `${move}, move ${index + 1} of ${algorithm.length}. Select to highlight.`);
    token.setAttribute("aria-pressed", "false");
    token.addEventListener("click", () => {
      pausePlayback();
      state.activeMove = index;
      renderActiveMove(algorithm);
    });
    token.addEventListener("mouseenter", () => {
      if (!state.isPlaying && state.activeMove === -1) {
        renderActiveMove(algorithm, index);
      }
    });
    token.addEventListener("mouseleave", () => {
      if (!state.isPlaying && state.activeMove === -1) {
        renderActiveMove(algorithm);
      }
    });
    moveLine.append(token);
  });

  moveLine.setAttribute("aria-label", `Algorithm: ${algorithm.join(", ")}`);
  renderActiveMove(algorithm);
}

function renderChecklist() {
  const step = steps[state.current];
  const done = state.completedTasks[state.current];
  const checklist = document.querySelector("#step-checklist");
  checklist.replaceChildren();

  step.tasks.forEach((task, index) => {
    const button = document.createElement("button");
    button.className = "checklist-item";
    button.type = "button";
    button.setAttribute("aria-pressed", String(done.has(index)));
    button.style.setProperty("--item-index", String(index));

    const check = document.createElement("span");
    check.className = "checklist-check";
    check.setAttribute("aria-hidden", "true");
    check.textContent = done.has(index) ? "✓" : "";

    const label = document.createElement("span");
    label.textContent = task;
    button.append(check, label);
    button.addEventListener("click", () => {
      const wasComplete = done.size === step.tasks.length;
      if (done.has(index)) {
        done.delete(index);
        sound.playTurn(450);
      } else {
        done.add(index);
        sound.playTurn(680);
      }
      renderChecklist();
      updateProgress();
      if (!wasComplete && done.size === step.tasks.length) {
        sound.playChime();
        celebrateStep();
      }
    });
    checklist.append(button);
  });

  document.querySelector("#checklist-progress").textContent = `${done.size} / ${step.tasks.length}`;
  const message = document.querySelector("#completion-message");
  message.hidden = done.size !== step.tasks.length;
  message.textContent = message.hidden ? "" : "Lovely work! This step is done.";
}

function celebrateStep() {
  if (reducedMotion.matches) return;
  const burst = document.createElement("div");
  burst.className = "completion-burst";
  burst.setAttribute("aria-hidden", "true");
  const colors = ["var(--green)", "var(--cube-yellow)", "var(--cube-red)", "var(--cube-blue)", "var(--cube-orange)", "#ffffff"];

  for (let index = 0; index < 20; index += 1) {
    const piece = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 20;
    const distance = 65 + (index % 4) * 15;
    piece.style.setProperty("--confetti-x", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--confetti-y", `${Math.sin(angle) * distance - 24}px`);
    piece.style.setProperty("--confetti-turn", `${180 + index * 37}deg`);
    piece.style.backgroundColor = colors[index % colors.length];
    burst.append(piece);
  }

  document.querySelector(".lesson-main").append(burst);
  window.setTimeout(() => burst.remove(), 1100);
}

const twistHints = {
  "U": {
    slice: "U",
    icon: "👆",
    tag: "PUSH TOP ➔ LEFT",
    title: "TOP LAYER — PUSH LEFT (U)",
    instruction: "Use your <strong>right index finger</strong> to flick/push the top layer to the <strong>left</strong> (90° clockwise from top).",
    path: "M 80 20 Q 50 10 22 20",
    head: "28,14 18,20 28,26"
  },
  "U′": {
    slice: "U",
    icon: "👈",
    tag: "PUSH TOP ➔ RIGHT",
    title: "TOP LAYER — PUSH RIGHT (U′)",
    instruction: "Use your <strong>left index finger</strong> to push the top layer to the <strong>right</strong> (90° counter-clockwise from top).",
    path: "M 20 20 Q 50 10 78 20",
    head: "72,14 82,20 72,26"
  },
  "R": {
    slice: "R",
    icon: "⬆️",
    tag: "TWIST RIGHT ⬆ UP",
    title: "RIGHT COLUMN — TWIST UP (R)",
    instruction: "Grip the right column with your <strong>right hand</strong> and twist it <strong>upward / away from you</strong> 90°.",
    path: "M 82 80 Q 86 50 82 22",
    head: "76,28 82,18 88,28"
  },
  "R′": {
    slice: "R",
    icon: "⬇️",
    tag: "PULL RIGHT ⬇ DOWN",
    title: "RIGHT COLUMN — PULL DOWN (R′)",
    instruction: "Pull the right column <strong>downward / toward you</strong> 90° with your <strong>right hand or thumb</strong>.",
    path: "M 82 20 Q 86 50 82 78",
    head: "76,72 82,82 88,72"
  },
  "R2": {
    slice: "R",
    icon: "⏫",
    tag: "TURN RIGHT 180° TWICE",
    title: "RIGHT COLUMN — DOUBLE TURN (R2)",
    instruction: "Twist the right column a full <strong>180° (two quarter turns)</strong> away from or toward you.",
    path: "M 82 80 Q 94 50 82 22",
    head: "76,28 82,18 88,28"
  },
  "F": {
    slice: "F",
    icon: "↻",
    tag: "TURN FRONT ↻ CLOCKWISE",
    title: "FRONT FACE — CLOCKWISE (F)",
    instruction: "Use your <strong>right index finger</strong> to push down on the front face, rotating it <strong>clockwise 90°</strong> (like turning a dial right).",
    path: "M 25 35 A 28 28 0 1 1 65 75",
    head: "68,68 65,78 57,72"
  },
  "F′": {
    slice: "F",
    icon: "↺",
    tag: "TURN FRONT ↺ COUNTER",
    title: "FRONT FACE — COUNTER-CLOCKWISE (F′)",
    instruction: "Use your <strong>right thumb</strong> to push up on the front face, rotating it <strong>counter-clockwise 90°</strong> (turning a dial left).",
    path: "M 75 35 A 28 28 0 1 0 35 75",
    head: "32,68 35,78 43,72"
  },
  "L": {
    slice: "L",
    icon: "⬇️",
    tag: "TWIST LEFT ⬇ DOWN",
    title: "LEFT COLUMN — PULL DOWN (L)",
    instruction: "Grip the left column with your <strong>left hand</strong> and pull it <strong>downward / toward you</strong> 90°.",
    path: "M 18 20 Q 14 50 18 78",
    head: "12,72 18,82 24,72"
  },
  "L′": {
    slice: "L",
    icon: "⬆️",
    tag: "TWIST LEFT ⬆ UP",
    title: "LEFT COLUMN — TWIST UP (L′)",
    instruction: "Twist the left column <strong>upward / away from you</strong> 90° with your <strong>left hand</strong>.",
    path: "M 18 80 Q 14 50 18 22",
    head: "12,28 18,18 24,28"
  },
  "D": {
    slice: "D",
    icon: "👉",
    tag: "PUSH BOTTOM ➔ LEFT",
    title: "BOTTOM LAYER — PUSH LEFT (D)",
    instruction: "Use your <strong>right ring finger</strong> to flick/push the bottom layer to the <strong>left</strong> (90° clockwise from below).",
    path: "M 80 80 Q 50 90 22 80",
    head: "28,74 18,80 28,86"
  },
  "D′": {
    slice: "D",
    icon: "👈",
    tag: "PUSH BOTTOM ➔ RIGHT",
    title: "BOTTOM LAYER — PUSH RIGHT (D′)",
    instruction: "Use your <strong>left ring finger</strong> to push the bottom layer to the <strong>right</strong> (90° counter-clockwise from below).",
    path: "M 20 80 Q 50 90 78 80",
    head: "72,74 82,80 72,86"
  }
};

function getCurrentAlgorithm() {
  const step = steps[state.current];
  if (!step.algorithm) return [];
  return state.alternative && step.alternate ? step.alternate : step.algorithm;
}

function renderActiveMove(algorithm) {
  const tokens = moveLine.querySelectorAll(".move-token");
  tokens.forEach((token, index) => {
    const active = index === state.activeMove;
    token.classList.toggle("is-active", active);
    token.setAttribute("aria-pressed", String(active));
  });

  const selected = algorithm[state.activeMove];
  document.querySelector("#move-counter").textContent = `MOVE ${state.activeMove < 0 ? 0 : state.activeMove + 1} / ${algorithm.length}`;
  miniCube.classList.toggle("is-move-selected", Boolean(selected));
  playLabel.textContent = state.isPlaying ? "Pause moves" : state.activeMove === algorithm.length - 1 ? "Replay moves" : state.activeMove < 0 ? "Play moves" : "Resume moves";
  playIcon.textContent = state.isPlaying ? "Ⅱ" : "▶";
  
  const moveFaceLabel = document.querySelector("#active-face-label-text");
  const twistCard = document.querySelector("#twist-hint-card");
  const twistIcon = document.querySelector("#twist-icon");
  const twistTitle = document.querySelector("#twist-action-title");
  const twistInstruction = document.querySelector("#twist-hint-instruction");
  const twistOverlay = document.querySelector("#twist-overlay");
  const twistCueTag = document.querySelector("#twist-cue-tag");
  const twistPath = document.querySelector("#twist-arrow-path");
  const twistHead = document.querySelector("#twist-arrow-head");

  // Remove all previous slice highlights
  miniCube.classList.remove(
    "highlight-slice-U",
    "highlight-slice-R",
    "highlight-slice-L",
    "highlight-slice-D",
    "highlight-slice-F"
  );

  if (selected) {
    sound.playTurn(580);
    const face = selected.replace(/[′2]/g, "");
    const direction = selected.includes("′") ? "counterclockwise" : selected.includes("2") ? "twice" : "clockwise";
    moveFaceLabel.textContent = `TURN ${face} ${direction.toUpperCase()}`;

    const hint = twistHints[selected];
    if (hint) {
      // Highlight the targeted layer on the mini-cube
      miniCube.classList.add(`highlight-slice-${hint.slice}`);

      // Update the twist hint card with step-by-step guidance
      if (twistCard) twistCard.classList.add("is-active-twist");
      if (twistIcon) twistIcon.textContent = hint.icon;
      if (twistTitle) twistTitle.textContent = hint.title;
      if (twistInstruction) twistInstruction.innerHTML = hint.instruction;

      // Update overlay directional arrow and cue tag on the diagram
      if (twistOverlay) twistOverlay.classList.add("is-active");
      if (twistCueTag) twistCueTag.textContent = hint.tag;
      if (twistPath) twistPath.setAttribute("d", hint.path);
      if (twistHead) twistHead.setAttribute("points", hint.head);
    }
  } else {
    moveFaceLabel.textContent = "STEP TARGET";
    if (twistOverlay) twistOverlay.classList.remove("is-active");
    if (twistCard) twistCard.classList.remove("is-active-twist");

    if (algorithm.length > 0) {
      if (twistIcon) twistIcon.textContent = "🎯";
      if (twistTitle) twistTitle.textContent = "READY TO MOVE";
      if (twistInstruction) twistInstruction.textContent = "Tap any move token above or press Play to see exactly where and which direction to twist.";
    } else {
      if (twistIcon) twistIcon.textContent = "✨";
      if (twistTitle) twistTitle.textContent = "INTUITIVE PLACEMENT";
      if (twistInstruction) twistInstruction.textContent = "No algorithm pattern needed for this step. Position the white edges directly around the white center.";
    }
  }
}

function updatePattern(step) {
  miniCube.querySelectorAll(".mini-tile").forEach((tile, index) => {
    const color = step.pattern[index];
    tile.style.transitionDelay = `${index * 30}ms`;
    tile.className = `mini-tile${color === "empty" ? "" : " is-target"}`;
    tile.style.backgroundColor = color === "empty" ? "#ebece7" : `var(--cube-${color})`;
  });
  miniCube.setAttribute("aria-label", step.label);
  document.querySelector("#diagram-caption").textContent = step.caption;
}

function updateProgress() {
  const count = state.completedTasks.filter((completed, index) => completed.size === steps[index].tasks.length).length;
  const percent = (count / steps.length) * 100;
  document.querySelector("#progress-fill").style.width = `${percent}%`;
  document.querySelector("#progress-number").textContent = String(count);
  document.querySelector("#progress-bar").setAttribute("aria-valuenow", String(count));
  document.querySelector("#progress-label").textContent = count === 0 ? "JUST GETTING STARTED" : count === steps.length ? "CUBE CONQUEROR" : "LOOK AT YOU GO";

  nav.querySelectorAll(".step-nav-button").forEach((button, index) => {
    const complete = state.completedTasks[index].size === steps[index].tasks.length;
    button.querySelector(".nav-check").textContent = complete ? "✓" : "";
    button.setAttribute("aria-label", `Step ${index + 1}: ${steps[index].short}, ${complete ? "completed" : `${state.completedTasks[index].size} of ${steps[index].tasks.length} tasks complete`}`);
  });
}

function pausePlayback() {
  if (state.playbackTimer !== null) window.clearTimeout(state.playbackTimer);
  state.playbackTimer = null;
  state.isPlaying = false;
  miniCube.classList.remove("is-playing");
  playIcon.textContent = "▶";
  playLabel.textContent = state.activeMove === getCurrentAlgorithm().length - 1 ? "Replay moves" : state.activeMove < 0 ? "Play moves" : "Resume moves";
}

function advancePlayback() {
  const algorithm = getCurrentAlgorithm();
  state.activeMove = state.activeMove >= algorithm.length - 1 ? 0 : state.activeMove + 1;
  renderActiveMove(algorithm);
  if (state.activeMove === algorithm.length - 1) {
    pausePlayback();
    playLabel.textContent = "Replay moves";
    return;
  }
  state.playbackTimer = window.setTimeout(advancePlayback, reducedMotion.matches ? 900 : 720);
}

function playAlgorithm() {
  if (state.isPlaying) {
    pausePlayback();
    return;
  }

  const algorithm = getCurrentAlgorithm();
  if (!algorithm.length) return;
  if (state.activeMove >= algorithm.length - 1) state.activeMove = -1;
  state.isPlaying = true;
  miniCube.classList.add("is-playing");
  playIcon.textContent = "Ⅱ";
  playLabel.textContent = "Pause moves";
  state.playbackTimer = window.setTimeout(advancePlayback, 180);
}

function setCubeView() {
  cube3d.style.setProperty("--view-x", `${state.cubeX}deg`);
  cube3d.style.setProperty("--view-y", `${state.cubeY}deg`);
  cube3d.classList.add("is-user-controlled");
}

function updateCubeMotionButton(isPlaying) {
  const spinButton = document.querySelector("#spin-cube-button");
  spinButton.setAttribute("aria-pressed", String(isPlaying));
  spinButton.setAttribute("aria-label", isPlaying ? "Pause cube rearrangement" : "Resume cube rearrangement");
  spinButton.title = isPlaying ? "Pause cube rearrangement" : "Resume cube rearrangement";
  spinButton.textContent = isPlaying ? "Ⅱ" : "▶";
}

function startCubeMotion() {
  state.cubeMotionRunning = true;
  cubeWrap.classList.remove("is-paused");
  cube3d.classList.add("is-user-controlled");
  setCubeView();
  if (state.cubeSpinAnimation) {
    state.cubeSpinAnimation.play();
  } else {
    state.cubeSpinAnimation = cubeRotor.animate([
      { transform: "rotateY(0deg)" },
      { transform: "rotateY(360deg)" }
    ], { duration: 18000, iterations: Infinity, easing: "linear" });
  }
  updateCubeMotionButton(true);
  if (state.cubeTurnAnimation) state.cubeTurnAnimation.play();
  else runCubeTurn();
}

function stopCubeMotion() {
  state.cubeMotionRunning = false;
  window.clearTimeout(state.cubeTurnTimer);
  state.cubeTurnTimer = null;
  if (state.cubeSpinAnimation?.playState === "running") state.cubeSpinAnimation.pause();
  if (state.cubeTurnAnimation?.playState === "running") state.cubeTurnAnimation.pause();
  cubeWrap.classList.add("is-paused");
  updateCubeMotionButton(false);
}

function rotateVector(vector, axis, direction) {
  const { x, y, z } = vector;
  if (axis === "x") return direction > 0 ? { x, y: -z, z: y } : { x, y: z, z: -y };
  if (axis === "y") return direction > 0 ? { x: z, y, z: -x } : { x: -z, y, z: x };
  return direction > 0 ? { x: -y, y: x, z } : { x: y, y: -x, z };
}

function finishCubeTurn(turn) {
  if (!state.cubeTurnActive || !state.cubeMotionRunning) return;
  const faceClasses = {
    "0,0,1": "front",
    "0,0,-1": "back",
    "1,0,0": "right",
    "-1,0,0": "left",
    "0,-1,0": "top",
    "0,1,0": "bottom"
  };
  state.cubeTurnAnimation = null;
  state.cubeTurnActive = false;

  state.cubelets.forEach(cubelet => {
    const coordinate = cubelet.position[turn.axis];
    if (coordinate === turn.layer) {
      cubelet.position = rotateVector(cubelet.position, turn.axis, turn.direction);
      cubelet.stickers.forEach(sticker => {
        sticker.normal = rotateVector(sticker.normal, turn.axis, turn.direction);
      });
    }
    renderCubelet(cubelet, 70, faceClasses);
    cubeRotor.append(cubelet.element);
  });
  cubeRotor.querySelector(".cube-turn-layer")?.remove();
  state.cubeTurnTimer = window.setTimeout(runCubeTurn, 420);
}

function runCubeTurn() {
  if (!state.cubeMotionRunning || state.cubeTurnActive) return;
  const turns = [
    { axis: "x", layer: -1 }, { axis: "x", layer: 1 },
    { axis: "y", layer: -1 }, { axis: "y", layer: 1 },
    { axis: "z", layer: -1 }, { axis: "z", layer: 1 }
  ];
  const turn = turns[Math.floor(Math.random() * turns.length)];
  turn.direction = Math.random() < 0.5 ? -1 : 1;
  const layer = document.createElement("div");
  layer.className = "cube-turn-layer";
  cubeRotor.append(layer);
  state.cubelets.forEach(cubelet => {
    if (cubelet.position[turn.axis] === turn.layer) layer.append(cubelet.element);
  });

  const angle = turn.direction * 90;
  const transform = `rotate${turn.axis.toUpperCase()}(${angle}deg)`;
  state.cubeTurnActive = true;
  state.cubeTurnAnimation = layer.animate(
    [{ transform: "none" }, { transform }],
    { duration: 720, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" }
  );
  state.cubeTurnAnimation.onfinish = () => finishCubeTurn(turn);
}

function rotateCubeView(deltaX, deltaY) {
  state.cubeX = Math.max(-75, Math.min(75, state.cubeX + deltaX));
  state.cubeY += deltaY;
  setCubeView();
}

function renderStep(index) {
  pausePlayback();
  state.activeMove = -1;
  state.current = Math.max(0, Math.min(index, steps.length - 1));
  state.alternative = false;
  const step = steps[state.current];
  if (!reducedMotion.matches) {
    document.querySelector(".lesson-card").animate(
      [{ opacity: 0.75, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 260, easing: "ease-out" }
    );
  }

  document.querySelector("#sidebar-count").textContent = `${String(state.current + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}`;
  document.querySelector("#step-tag").textContent = `STEP ${String(state.current + 1).padStart(2, "0")}`;
  document.querySelector("#lesson-time").textContent = step.time;
  document.querySelector("#step-title").textContent = step.title;
  document.querySelector("#step-description").textContent = step.description;
  document.querySelector("#step-tip").textContent = step.tip;
  renderChecklist();
  renderMoves(step);
  updatePattern(step);

  nav.querySelectorAll(".step-nav-button").forEach((button, buttonIndex) => {
    if (buttonIndex === state.current) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });

  previousButton.disabled = state.current === 0;
  nextButton.innerHTML = state.current === steps.length - 1
    ? 'Start again <span aria-hidden="true">↺</span>'
    : 'Next step <span aria-hidden="true">→</span>';
  nextButton.classList.toggle("is-complete", state.current === steps.length - 1);
  updateProgress();
}

initBackground();
initThemeAndSound();
makeHeroCube();
makeNav();
renderStep(0);

playButton.addEventListener("click", playAlgorithm);
previousButton.addEventListener("click", () => {
  sound.playTurn(550);
  renderStep(state.current - 1);
});
nextButton.addEventListener("click", () => {
  sound.playTurn(550);
  renderStep(state.current === steps.length - 1 ? 0 : state.current + 1);
});
document.querySelector("#move-prev-button").addEventListener("click", () => {
  pausePlayback();
  state.activeMove = Math.max(0, state.activeMove - 1);
  renderActiveMove(getCurrentAlgorithm());
});
document.querySelector("#move-next-button").addEventListener("click", () => {
  pausePlayback();
  state.activeMove = Math.min(getCurrentAlgorithm().length - 1, state.activeMove + 1);
  renderActiveMove(getCurrentAlgorithm());
});
document.querySelector("#rotate-cube-button").addEventListener("click", () => {
  sound.playTurn(500);
  rotateCubeView(0, 45);
});
document.querySelector("#spin-cube-button").addEventListener("click", () => {
  if (state.cubeMotionRunning) stopCubeMotion();
  else startCubeMotion();
});
cubeWrap.addEventListener("pointerdown", event => {
  state.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  cubeWrap.setPointerCapture(event.pointerId);
});
cubeWrap.addEventListener("pointermove", event => {
  if (!state.pointer || state.pointer.id !== event.pointerId) return;
  const deltaX = event.clientX - state.pointer.x;
  const deltaY = event.clientY - state.pointer.y;
  state.pointer.x = event.clientX;
  state.pointer.y = event.clientY;
  if (deltaX || deltaY) rotateCubeView(-deltaY * 0.65, deltaX * 0.65);
});
cubeWrap.addEventListener("pointerup", () => { state.pointer = null; });
cubeWrap.addEventListener("pointercancel", () => { state.pointer = null; });
cubeWrap.addEventListener("keydown", event => {
  const rotations = {
    ArrowUp: [-12, 0],
    ArrowDown: [12, 0],
    ArrowLeft: [0, -12],
    ArrowRight: [0, 12]
  };
  if (!rotations[event.key]) return;
  event.preventDefault();
  rotateCubeView(...rotations[event.key]);
});

startCubeMotion();

reducedMotion.addEventListener("change", event => {
  if (event.matches && state.cubeMotionRunning) {
    stopCubeMotion();
  }
});
