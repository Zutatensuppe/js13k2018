((d, w) => {
  const timestamp = () => w.performance.now()

  const randint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  const randbool = () => randint(0, 1) === 0

  const run = options => {
    const fps = options.fps || 60
    const slow = options.slow || 1
    const update = options.update
    const render = options.render
    const canvas = options.canvas
    const raf = w.requestAnimationFrame
    const step = 1 / fps
    const slowStep = slow * step

    let now
    let dt = 0
    let last = timestamp()

    const frame = () => {
      now = timestamp()
      dt = dt + Math.min(1, (now - last) / 1000) // duration capped at 1.0 seconds
      while (dt > slowStep) {
        dt = dt - slowStep
        update(step)
      }
      render(dt / slow)
      last = now
      raf(frame, canvas)
    }

    raf(frame)
  }

  const GRAVITY = 9 / 16

  const STATE_MENU = 0;
  const STATE_GAME = 1;
  const STATE_DEAD = 2;

  const STATE_DEFAULT = 0;
  const STATE_DUCK = 1;
  const STATE_HAS_ON_TOP = 2;

  const FPS = 60;

  const BOX_SIZE = 32;

  const DINO_SIZE = 32;

  const CACTUS_HEIGHT = 24;
  const CACTUS_WIDTH = 18;

  const PTERO_WIDTH = 32
  const PTERO_HEIGHT = 20

  const ENEMY_CACTUS = 0
  const ENEMY_PTERO = 1

  const CACTUS_CHANCE = 33;
  const ENEMY_CHANCE = 50;

  const initGfx = () => {
    let dinoBB = [
      [15, 6, 9, 14],
      [24, 13, 4, 7],
      [10, 22, 8, 10],
      [4, 20, 3, 7],
      [7, 22, 3, 7],
      [12, 20, 10, 4],
      [14, 18, 6, 9],
    ]
    let dinoDuckBB = [
      [10, 22, 8, 10],
      [6, 23, 4, 7],
      [1, 23, 5, 3],
      [19, 15, 9, 13],
      [18, 23, 5, 8],
      [25, 22, 7, 6],
    ]
    let pteroBB0 = [
      [1, 8, 9, 12],
      [6, 2, 2, 6],
      [8, 0, 9, 17],
      [17, 4, 6, 12],
      [4, 8, 4, 8],
      [27, 8, 5, 5],
    ]
    let pteroBB1 = [
      [1, 8, 31, 4],
      [5, 12, 20, 2],
      [9, 6, 8, 9],
      [2, 14, 8, 3],
      [17, 3, 6, 5],
      [23, 5, 5, 3],
    ]
    let pteroBB2 = [
      [1, 8, 31, 4],
      [5, 12, 20, 2],
      [9, 6, 8, 9],
      [2, 14, 8, 3],
      [17, 3, 6, 5],
      [23, 5, 5, 3],
    ]
    let pteroBB3 = [
      [1, 7, 31, 4],
      [4, 6, 15, 10],
      [17, 2, 6, 5],
      [23, 4, 5, 3],
    ]
    return {
      DINO_DUCK: [146, 0, DINO_SIZE, DINO_SIZE, dinoDuckBB],
      DINO_DUCK_REV: [178, 0, DINO_SIZE, DINO_SIZE, dinoDuckBB],
      DINO: [
        [114, 0, DINO_SIZE, DINO_SIZE, dinoBB],
        [306, 0, DINO_SIZE, DINO_SIZE, dinoBB],
        [338, 0, DINO_SIZE, DINO_SIZE, dinoBB],
        [306, 0, DINO_SIZE, DINO_SIZE, dinoBB],
      ],
      DINO_REV: [
        [210, 0, DINO_SIZE, DINO_SIZE, dinoBB],
        [242, 0, DINO_SIZE, DINO_SIZE, dinoBB],
        [274, 0, DINO_SIZE, DINO_SIZE, dinoBB],
        [242, 0, DINO_SIZE, DINO_SIZE, dinoBB],
      ],
      ENEMY: [
        [370, 0, PTERO_WIDTH, PTERO_HEIGHT, pteroBB0],
        [370 + PTERO_WIDTH, 0, PTERO_WIDTH, PTERO_HEIGHT, pteroBB1],
        [370 + PTERO_WIDTH * 2, 0, PTERO_WIDTH, PTERO_HEIGHT, pteroBB2],
        [370 + PTERO_WIDTH * 3, 0, PTERO_WIDTH, PTERO_HEIGHT, pteroBB3],
        [370 + PTERO_WIDTH * 2, 0, PTERO_WIDTH, PTERO_HEIGHT, pteroBB2],
        [370 + PTERO_WIDTH, 0, PTERO_WIDTH, PTERO_HEIGHT, pteroBB1],
      ],
      ENEMY_REV: [
        [498, 0, PTERO_WIDTH, PTERO_HEIGHT, pteroBB0],
        [498 + PTERO_WIDTH, 0, PTERO_WIDTH, PTERO_HEIGHT, pteroBB1],
        [498 + PTERO_WIDTH * 2, 0, PTERO_WIDTH, PTERO_HEIGHT, pteroBB2],
        [498 + PTERO_WIDTH * 3, 0, PTERO_WIDTH, PTERO_HEIGHT, pteroBB3],
        [498 + PTERO_WIDTH * 2, 0, PTERO_WIDTH, PTERO_HEIGHT, pteroBB2],
        [498 + PTERO_WIDTH, 0, PTERO_WIDTH, PTERO_HEIGHT, pteroBB1],
      ],
      CACTUS: [
        [96, 0, CACTUS_WIDTH, CACTUS_HEIGHT, [
          [5, 0, 8, 24],
          [0, 9, 5, 9],
          [12, 11, 6, 11],
        ]],
      ],
      BOX: [
        [0, 0, BOX_SIZE, BOX_SIZE],
        [32, 0, BOX_SIZE, BOX_SIZE],
      ],
      BOX_SLEEP: [
        [64, 0, BOX_SIZE, BOX_SIZE],
      ],
    }
  }

  const inViewport = (thing) => {
    // outside (top)
    if (thing.y + thing.h < viewport.y) {
      return false
    }

    // outside (left)
    if (thing.x + thing.w < 0) {
      return false
    }

    // outside (right)
    if (thing.x - thing.w > viewport.w) {
      return false
    }

    return true
  }

  const overlaps = (a, player) => {
    let aBoxes = a.gfx[4]
    let bBoxes = player.gfx[4]

    var ax = a.velocity_x < 0 ? a.w : 0
    var ap = a.velocity_x < 0 ? -1 : 1
    var bx = player.velocity_x < 0 ? player.w : 0
    var bp = player.velocity_x < 0 ? -1 : 1

    for (let i = 0; i < aBoxes.length; i++) {
      for (let j = 0; j < bBoxes.length; j++) {
        let A = [
          a.x + ax + aBoxes[i][0] * ap,
          a.y + aBoxes[i][1],
          a.x + ax + (aBoxes[i][0] + aBoxes[i][2]) * ap,
          a.y + aBoxes[i][1] + aBoxes[i][3],
        ]
        let B = [
          player.x + bx + (bBoxes[j][0]) * bp,
          player.y + bBoxes[j][1],
          player.x + bx + (bBoxes[j][0] + bBoxes[j][2]) * bp,
          player.y + bBoxes[j][1] + bBoxes[j][3],
        ]
        if (A[0] < B[2] && A[2] > B[0] && A[1] < B[3] && A[3] > B[1]) {
          return true
        }
      }
    }
    return false
  }

  const canvas = d.getElementById('game')
  canvas.focus()

  const keys = {}
  canvas.addEventListener('keydown', e => {
    keys[e.key] = true
  })
  canvas.addEventListener('keyup', e => {
    keys[e.key] = false
  })

  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false

  const isJump = keys => keys['w'] || keys['ArrowUp'] || keys[' ']
  const isDown = keys => keys['s'] || keys['ArrowDown']
  const isLeft = keys => keys['a'] || keys['ArrowLeft']
  const isRight = keys => keys['d'] || keys['ArrowRight']

  const viewport = {
    x: 0,
    y: 0,
    w: 320,
    h: 480,
  };

  const BASE_X = 160;

  let color = '#fff';
  let invColor = '#222';
  let steps = 0;

  let state = STATE_MENU;

  let score = 0
  let hiscore = w.localStorage.getItem('hiscore') || 0

  const img = (path, cb) => {
    var image = new Image();
    image.onload = cb
    image.src = path
    return image
  }
  let _sprite;

  const GFX = initGfx()

  const box = (x, y) => {
    return {
      state: STATE_DEFAULT,
      velocity_x: 0,
      velocity_y: 0,
      x: x,
      y: y,
      w: BOX_SIZE,
      h: BOX_SIZE,
      gfx: GFX.BOX_SLEEP[0]
    }
  }

  const enemy = (x, y, velocity_x, velocity_y = 0) => {
    return {
      type: ENEMY_PTERO,
      state: STATE_DEFAULT,
      velocity_x: velocity_x,
      velocity_y: velocity_y,
      x: x,
      y: y,
      w: PTERO_WIDTH,
      h: PTERO_HEIGHT,
      gfx: velocity_x > 0 ? GFX.ENEMY : GFX.ENEMY_REV,
    }
  }

  const cactus = (x, y) => {
    return {
      type: ENEMY_CACTUS,
      state: STATE_DEFAULT,
      velocity_x: 0,
      velocity_y: 0,
      x: x,
      y: y,
      w: CACTUS_WIDTH,
      h: CACTUS_HEIGHT,
      gfx: GFX.CACTUS,
    }
  }

  let player
  let boxes = [];
  let enemies = [];
  let lvlSpeed;
  let lvlSpeedup;

  const maybe = (chance, cb) => {
    if (randint(0, 100) < chance) {
      cb()
    }
  }

  const init = () => {
    steps = 0;
    color = '#fff'
    invColor = '#222'

    lvlSpeed = 0.5;
    lvlSpeedup = 0.1;
    score = 0

    viewport.x = 0
    viewport.y = 0

    player = {
      mirror: false,
      state: STATE_DEFAULT,
      velocity_x: 0,
      velocity_y: 0,
      x: 160 - 16,
      y: 128,
      w: 32,
      h: 32,
      gfx: GFX.DINO[0],
    }

    boxes = []
    boxes.push(box(
      160 - 16,
      player.y + player.h
    ))
    for (let i = 8; i < viewport.h * 2 / BOX_SIZE; i++) {
      boxes.push(box(
        randint(0, viewport.w - BOX_SIZE),
        i * BOX_SIZE
      ))
    }

    enemies = []
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].y > player.x + player.h) {
        maybeCreateCactus(boxes[i])
      }
    }
  }

  let canStartGame = true
  var INSTRUMENT_BEEP = 5;
  var INSTRUMENT_BEEP2 = 6;
  var INSTRUMENTS = {};
  INSTRUMENTS[INSTRUMENT_BEEP] = jsfxr([2,,0.04,0.2,0.4,0.5,,,,,,,,,,,,,1,,,,,0.1]);
  INSTRUMENTS[INSTRUMENT_BEEP2] = jsfxr([1,,0.09,0.2,0.4,0.5,,,,,,,,,,,,,1,,,,,0.1]);

  const music = () => {
    // instruments have numbers 1 - ....
    // loops have numbers 101 - ....
    var DRUMLOOP = 101;
    var loops = {};
    loops[DRUMLOOP] = [
      [{n: INSTRUMENT_BEEP, p: .4}],
      [],
      [{n: INSTRUMENT_BEEP, p: .4}],
      [],
      [{n: INSTRUMENT_BEEP, p: .5}],
      [],
      [{n: INSTRUMENT_BEEP, p: .6}],
      []
    ];

    var song = [
      [DRUMLOOP],
      [],
      [],
      [],
      [],
      [],
      [],
      [],

      [DRUMLOOP],
      [],
      [],
      [],
      [],
      [],
      [],
      [],

      [DRUMLOOP],
      [],
      [],
      [],
      [],
      [],
      [],
      [],

      [DRUMLOOP],
      [],
      [],
      [],
      [],
      [],
      [],
      [],

      [DRUMLOOP, {n: INSTRUMENT_BEEP2, p: 1}],
      [],
      [{n: INSTRUMENT_BEEP2, p: .6}],
      [],
      [],
      [],
      [],
      [],

      [DRUMLOOP],
      [],
      [],
      [],
      [],
      [],
      [],
      [],

      [DRUMLOOP],
      [],
      [],
      [],
      [],
      [],
      [],
      [],

      [DRUMLOOP, {n: INSTRUMENT_BEEP2, p: .7}],
      [],
      [],
      [],
      [{n: INSTRUMENT_BEEP2, p: .8}],
      [],
      [],
      [],

      [DRUMLOOP, {n: INSTRUMENT_BEEP2, p: 1.2}],
      [],
      [{n: INSTRUMENT_BEEP2, p: .9}],
      [],
      [{n: INSTRUMENT_BEEP2, p: .6}],
      [],
      [],
      [{n: INSTRUMENT_BEEP2, p: .9}],

      [DRUMLOOP, {n: INSTRUMENT_BEEP2, p: .6}],
      [],
      [],
      [],
      [{n: INSTRUMENT_BEEP2, p: .8}],
      [],
      [],
      [],

      [DRUMLOOP, {n: INSTRUMENT_BEEP2, p: .9}],
      [],
      [],
      [],
      [],
      [],
      [],
      [],

      [DRUMLOOP, {n: INSTRUMENT_BEEP2, p: 1.2}],
      [],
      [{n: INSTRUMENT_BEEP2, p: 1}],
      [],
      [{n: INSTRUMENT_BEEP2, p: .8}],
      [],
      [{n: INSTRUMENT_BEEP2, p: .6}],
      [],

      [DRUMLOOP, {n: INSTRUMENT_BEEP2, p: 1}],
      [],
      [{n: INSTRUMENT_BEEP2, p: .6}],
      [],
      [],
      [],
      [],
      [],
    ];

    // Fire up a sequencer with all of the above
    new Sequencer([
      200, // milliseconds per beat
      INSTRUMENTS, // The Audio Elements
      loops, // Loops
      song, // The actual song
      true, // Loop over and over
      1.4 // seconds buffer. ~min Chrome lets us have in a background tab
    ]).play();
  }

  function ArcadeAudio() {
    this.sounds = {};
  }
  ArcadeAudio.prototype.add = function( key, count, settings ) {
    this.sounds[ key ] = [];
    settings.forEach( function( elem, index ) {
      this.sounds[ key ].push( {
        tick: 0,
        count: count,
        pool: []
      } );
      for( var i = 0; i < count; i++ ) {
        var audio = new Audio();
        audio.src = jsfxr( elem );
        this.sounds[ key ][ index ].pool.push( audio );
      }
    }, this );
  };
  ArcadeAudio.prototype.play = function( key ) {
    var sound = this.sounds[ key ];
    var soundData = sound.length > 1 ? sound[ Math.floor( Math.random() * sound.length ) ] : sound[ 0 ];
    soundData.pool[ soundData.tick ].play();
    soundData.tick < soundData.count - 1 ? soundData.tick++ : soundData.tick = 0;
  };

  var aa = new ArcadeAudio();
  aa.add('die', 1, [[3,,0.1645,0.7236,0.34,0.03,,,,,,,,,,,,,1,,,,,0.4]])
  aa.add('jump', 2, [[1,,0.1,,0.1,0.3,,0.2,,,,,,,,0.3,,,1,,,,,0.2]])

  const die = () => {
    state = STATE_DEAD
    hiscore = Math.max(hiscore, score)
    w.localStorage.setItem('hiscore', hiscore)
    canStartGame = false
    aa.play('die')
  }

  const jump = () => {
    player.velocity_y = -9
    aa.play('jump')
  }

  let sized = false
  const updateNonGame = keys => {
    if (!canStartGame) {
      canStartGame = !isJump(keys)
      return
    }

    if (isJump(keys)) {
      if (!sized) {
        let cur = viewport.h
        let inter = setInterval(() => {
          if (cur >= w.innerHeight) {
            canvas.style=`height: 100%;`
            clearInterval(inter)
            return
          }
          canvas.style=`height: ${cur}px;`
          cur += 20;
        }, 15)
        sized = true
        music()
      }
      state = STATE_GAME
      init()
      jump()
    }
  }

  const maybeCreateCactus = box => {
    maybe(CACTUS_CHANCE, () => {
      enemies.push(cactus(
        box.x + BOX_SIZE / 2 - CACTUS_WIDTH / 2,
        box.y - CACTUS_HEIGHT,
      ))
    })
  }

  const maybeAddEnemy = () => {
    maybe(ENEMY_CHANCE, () => {
      let velocity_x = randbool() ? -2 : 2
      enemies.push(enemy(
        velocity_x > 0 ? -PTERO_WIDTH : viewport.w + PTERO_WIDTH,
        randint(viewport.y + viewport.h / 2, viewport.y + viewport.h),
        velocity_x,
        randint(-1, 1),
      ))
    })
  }

  const swapColors = () => {
    const x = color;
    color = invColor;
    invColor = x;
  }

  const onNextDay = () => {
    swapColors()
    lvlSpeed += lvlSpeedup;
  }

  const every = (val, s, cb) => {
    if (val % s === 0) {
      cb()
    }
  }

  const increaseScore = () => {
    score++;
  }

  const updatePlayer = keys => {
    player.velocity_x = 0
    player.velocity_y += GRAVITY
    player.state = isDown(keys) ? STATE_DUCK : STATE_DEFAULT;

    if (isLeft(keys)) {
      player.velocity_x = -2
      player.mirror = true
    } else if (isRight(keys)) {
      player.velocity_x = 2
      player.mirror = false
    }

    let futureY = player.y + player.velocity_y
    let possibleYOnBox = parseInt(futureY - (futureY % BOX_SIZE), 10)
    boxes.map(b => {
      let overlapsX = (player.x - player.w / 5) > (b.x - b.w)
        && (player.x + player.w / 5) < (b.x + b.w)

      let yOnBox = b.y - player.h

      let comesFromTop = yOnBox >= player.y && yOnBox === possibleYOnBox

      if (overlapsX && comesFromTop) {
        player.y = yOnBox
        if (isJump(keys)) {
          jump()
        } else {
          player.velocity_y = 0
        }
        b.state = STATE_HAS_ON_TOP
      } else {
        b.state = STATE_DEFAULT
      }
    })

    if (isDown(keys)) {
      if (player.velocity_y === 0) {
        player.velocity_x = 0
      }
    }

    player.y += player.velocity_y
    player.x += player.velocity_x

    if (player.state === STATE_DUCK) {
      player.gfx = player.mirror ? GFX.DINO_DUCK_REV : GFX.DINO_DUCK
    } else {
      let gfx = player.mirror ? GFX.DINO_REV : GFX.DINO
      player.gfx = player.velocity_x ? getAnimatedGfx(gfx, 5) : gfx[0];
    }

    if (player.y + player.h / 2 > viewport.y + viewport.h) {
      die()
    }
  }

  const updateBoxes = () => {
    let before = boxes.length

    boxes = boxes.filter(b => inViewport(b))

    for (let i = 0; i < before - boxes.length; i++) {
      const b = box(
        randint(0, viewport.w - BOX_SIZE),
        boxes[boxes.length - 1].y + BOX_SIZE
      )

      b.gfx = b.state === 0 ? GFX.BOX_SLEEP[0] : getAnimatedGfx(GFX.BOX, 60)

      boxes.push(b)
      maybeCreateCactus(b)
    }
  }

  const updateEnemies = () => {
    enemies = enemies.filter(e => inViewport(e)).map(e => {
      e.x += e.velocity_x
      e.y += e.velocity_y

      e.gfx = getAnimatedGfx(gfxByEnemy(e), 10)
      return e
    })
  }

  const checkCollisions = () => {
    if (enemies.find(e => overlaps(e, player))) {
      die()
    }
  }

  const updateGame = keys => {
    steps++;

    updateBoxes()
    updateEnemies()
    updatePlayer(keys)

    checkCollisions()

    every(steps, 10, increaseScore)
    every(steps, FPS * 12, onNextDay)
    every(steps, FPS, maybeAddEnemy)

    // level is moving up always..
    viewport.y += lvlSpeed;
  }

  const update = () => {
    if (state === STATE_GAME) {
      updateGame(keys)
    } else {
      updateNonGame(keys)
    }
  }

  const renderSprite = (x, y, sprite) => {
    ctx.drawImage(
      _sprite,
      sprite[0],
      sprite[1],
      sprite[2],
      sprite[3],
      BASE_X + x - viewport.x,
      y - viewport.y,
      sprite[2],
      sprite[3],
    )
  }
  const renderTxt = (x, y, txt) => {
    ctx.fillText(txt, BASE_X + x - viewport.x, y - viewport.y)
  }
  const renderTxtAbs = (x, y, txt) => {
    ctx.fillText(txt, BASE_X + x, y)
  }

  const gfxByEnemy = enemy => {
    if (enemy.type === ENEMY_CACTUS) {
      return GFX.CACTUS
    }
    if (enemy.type === ENEMY_PTERO) {
      return enemy.velocity_x > 0 ? GFX.ENEMY : GFX.ENEMY_REV
    }
    throw new Error('')
  }

  const getAnimatedGfx = (images, speed) => {
    let mod = steps % (images.length * speed)
    for (let i = 0; i <= images.length; i++) {
      if (mod < speed * (i + 1)) {
        return images[i]
      }
    }
    return images[0]
  }


  const fillRect = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  const clearCtx = () => {
    d.body.style.backgroundColor = color;
    fillRect(0, 0, canvas.width, canvas.height, color);
  }

  const drawHud = () => {
    let padded = number => (`00000${number}`).slice(-5);
    let tw = text => ctx.measureText(text).width
    let text = `HI ${padded(hiscore)} ${padded(score)}`
    ctx.font = 'bold 18px Courier';
    ctx.fillStyle = invColor;
    renderTxtAbs(viewport.w - 16 - tw(text), 16, text)
    if (state === STATE_DEAD) {
      let text = 'GAME OVER'
      renderTxtAbs(viewport.w/2 - tw(text)/2, viewport.h/2, text)
    }
  }

  const drawBorders = () => {
    fillRect(0, 0, BASE_X, viewport.h, invColor)
    fillRect(BASE_X + viewport.w, 0, BASE_X, viewport.h, invColor)

    fillRect(0, 0, BASE_X -1, viewport.h, color)
    fillRect(BASE_X + viewport.w + 1, 0, BASE_X, viewport.h, color)
  }

  const drawLvlOverlay = () => {
    if (state === STATE_DEAD) {
      fillRect(0, 0, canvas.width, canvas.height, color === '#fff'
        ? 'rgba(255, 255, 255, 0.5)'
        : 'rgba(0,0,0, 0.5)');
    }
  }

  const drawEntities = () => {
    // boxes
    for (let i = 0; i < boxes.length; i++) {
      renderSprite(boxes[i].x, boxes[i].y, boxes[i].gfx)
    }

    // enemies
    for (let i = 0; i < enemies.length; i++) {
      renderSprite(enemies[i].x, enemies[i].y, enemies[i].gfx)
    }

    // player
    renderSprite(player.x, player.y, player.gfx)
  }

  const drawMenu = () => {
    renderSprite(player.x, player.y, player.gfx)

    ctx.font = "13px 'Segoe UI', Tahoma, sans-serif"
    ctx.fillStyle = '#646464'
    renderTxt(64, player.y + 188, `DNS_PROBE_FINISHED_NO_INTERNET`)

    ctx.fillStyle = invColor;
    renderTxt(64, player.y + 96, `Try:`)
    renderTxt(64 + 12, player.y + 116, `● Checking the network cable or router`)
    renderTxt(64 + 12, player.y + 136, `● Resetting the modem or router`)
    renderTxt(64 + 12, player.y + 156, `● Reconnecting to Wi-Fi`)

    ctx.font = "24px 'Segoe UI', Tahoma, sans-serif";
    renderTxt(64, player.y + 64, `No Internet`)
  }

  const render = () => {
    clearCtx()

    if (state === STATE_MENU) {
      drawMenu()
      return
    }

    drawEntities()
    drawBorders()
    drawLvlOverlay()
    drawHud()
  }

  _sprite = img('src/spritesheet.png', () => {
    init()
    run({
      fps: FPS,
      update: update,
      render: render,
      canvas: canvas
    })
  })
})(document, window)