// ----- Start of the assigment ----- //

class ParticleSystem extends PIXI.Container {
  constructor() {
    super();
    // Set start and duration for this effect in milliseconds
    this.start = 0;
    this.duration = 8000;
    // Create multiple coins
    for (let i = 0; i < 20; i++) {
      let sp = game.sprite("CoinsGold000");
      sp.pivot.x = sp.width / 3;
      sp.pivot.y = sp.height / 3;
      // Set starting position in the middle of the screen
      sp.x = 400;
      sp.y = 225;
      // Set random starting velocity in the shape of an M
      if (i < 10 || i >= 40) {
        sp.vx = (Math.random() - 0.5) * 10;
        sp.vy = -10;
      } else if (i < 20 || i >= 30) {
        sp.vx = (Math.random() - 0.5) * 10;
        sp.vy = -5;
      } else {
        sp.vx = (Math.random() - 0.5) * 10;
        sp.vy = 0;
      }
      // Set the lifetime of the coin to a random value between 2000 and 5000 milliseconds
      sp.lifetime = Math.floor(Math.random() * 3000) + 2000;
      this.addChild(sp);
    }
  }
  animTick(nt) {
    const screenHeight = 450;
    const screenWidth = 800;
    const screenCenterX = screenWidth / 2;
    const screenCenterY = screenHeight / 2;

    // Animate position, rotation, and alpha for each coin
    this.children.forEach((coin) => {
      coin.x += coin.vx; // Move the coin horizontally
      coin.y += coin.vy; // Move the coin vertically
      coin.rotation += 0.01; // Spin the coin

      // Apply gravity to the coins
      coin.vy += 0.1;

      // Bounce the coin off the screen edges
      if (coin.x < 0 || coin.x > screenWidth) {
        coin.vx *= -0.95;
        coin.x = Math.max(0, Math.min(screenWidth, coin.x));
      }
      if (coin.y < 0 || coin.y > screenHeight) {
        coin.vy *= -0.9;
        coin.y = Math.max(0, Math.min(screenHeight, coin.y));
      }

      // If coin reaches the top of the screen, set it to fall down in a random direction
      if (coin.y <= 0) {
        coin.y = 0;
        coin.vy = Math.random() * 10;
        coin.vx = (Math.random() - 0.5) * 10;
      }

      // If coin reaches the middle of the screen, set it to fly up in a random direction
      if (coin.x === screenCenterX && coin.y === screenCenterY) {
        coin.vy = -(Math.random() * 10);
        coin.vx = (Math.random() - 0.5) * 10;
      }

      // Update the lifetime of the coin
      coin.lifetime -= 16;

      // If the lifetime of the coin is less than or equal to 0, remove it from the particle system
      if (coin.lifetime <= 0) {
        this.removeChild(coin);
      }
    });
  }
}

// ----- End of the assigment ----- //

class Game {
  constructor(props) {
    this.totalDuration = 3000;
    this.effects = [];
    this.renderer = new PIXI.WebGLRenderer(800, 450);
    document.body.appendChild(this.renderer.view);
    this.stage = new PIXI.Container();
    this.loadAssets(props && props.onload);
  }
  loadAssets(cb) {
    let textureNames = [];
    // Load coin assets
    for (let i = 0; i <= 8; i++) {
      let num = ("000" + i).substr(-3);
      let name = "CoinsGold" + num;
      let url = "gfx/CoinsGold/" + num + ".png";
      textureNames.push(name);
      PIXI.loader.add(name, url);
    }
    PIXI.loader.load(
      function (loader, res) {
        // Access assets by name, not url
        let keys = Object.keys(res);
        for (let i = 0; i < keys.length; i++) {
          var texture = res[keys[i]].texture;
          if (!texture) continue;
          PIXI.utils.TextureCache[keys[i]] = texture;
        }
        // Assets are loaded and ready!
        this.start();
        cb && cb();
      }.bind(this)
    );
  }
  start() {
    this.isRunning = true;
    this.t0 = Date.now();
    update.bind(this)();
    function update() {
      if (!this.isRunning) return;
      this.tick();
      this.render();
      requestAnimationFrame(update.bind(this));
    }
  }
  addEffect(eff) {
    this.totalDuration = Math.max(
      this.totalDuration,
      eff.duration + eff.start || 0
    );
    this.effects.push(eff);
    this.stage.addChild(eff);
  }
  render() {
    this.renderer.render(this.stage);
  }
  tick() {
    let gt = Date.now();
    let lt = (gt - this.t0) % this.totalDuration;
    for (let i = 0; i < this.effects.length; i++) {
      let eff = this.effects[i];
      if (lt > eff.start + eff.duration || lt < eff.start) continue;
      let elt = lt - eff.start;
      let ent = elt / eff.duration;
      eff.animTick(ent, elt, gt);
    }
  }
  sprite(name) {
    return new PIXI.Sprite(PIXI.utils.TextureCache[name]);
  }
  setTexture(sp, name) {
    sp.texture = PIXI.utils.TextureCache[name];
    if (!sp.texture) console.warn("Texture '" + name + "' don't exist!");
  }
}

window.onload = function () {
  function startEffect() {
    game.addEffect(new ParticleSystem());
  }

  window.game = new Game({
    onload: function () {
      // Start the effect immediately
      startEffect();
      // Repeat the effect every 5 seconds with a 2 second delay
      setInterval(startEffect, 1000);
    },
  });
};
