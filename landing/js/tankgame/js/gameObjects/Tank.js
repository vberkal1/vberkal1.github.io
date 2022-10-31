class Tank extends GameObject {
  constructor(
    game,
    x,
    y,
    angle,
    spriteHref = 'js/tankgame/img/tank.png',
    width = 25,
    height = 25
  ) {

    super(game, width, height, x, y, angle, new Vector(), new Rectangle(), spriteHref);
    this.stats = {
      maxSpeed: 350,
      maxBackSpeed: 200,
      enginePower: 1000,
      angleSpeed: 360 / 180 * Math.PI,
      friction: 160,
      normalFriction: 2400,

      shootPerSec: 1,
      shootCapacity: 10000,
      shootReloadTime: 2,
    }

    this.physicsStats.friction = this.stats.friction;
    this.physicsStats.normalFriction = this.stats.normalFriction;
    this.physicsStats.mass = 2;

    this.shootMagazine = {
      perShootStatus: [],
      prevShootTime: 0,
      curShootId: 0
    };
    this.controlStatus = {
      gas: false,
      leftTurn: false,
      rightTurn: false,
      brake: false,
      shoot: false,
    }

    this.#initObject();
  }

  nextFrame(deltaTime) {
    this.#kineticFrame(deltaTime);

    super.nextFrame(deltaTime);

    if (this.controlStatus.shoot) {
      this.#tryShoot();
    }
  }

  handleCollision() {

  }

  handleControl(e) {
    const isDawn = e.type === 'keydown';
    switch (e.code) {
      case 'gas':
        this.controlStatus.gas = isDawn;
        break;
      case 'leftTurn':
        this.controlStatus.leftTurn = isDawn;
        break;
      case 'break':
        this.controlStatus.brake = isDawn;
        break;
      case 'rightTurn':
        this.controlStatus.rightTurn = isDawn;
        break;
      case 'shoot':
        this.controlStatus.shoot = isDawn;
        break;
    }
  }

  #tryShoot() {
    if (
      this.shootMagazine.perShootStatus[this.shootMagazine.curShootId] < this.game.engineTime - this.stats.shootReloadTime * 1000
      && this.shootMagazine.prevShootTime < this.game.engineTime - 1000/this.stats.shootPerSec
    ) {
      this.shootMagazine.perShootStatus[this.shootMagazine.curShootId] = this.game.engineTime;
      this.shootMagazine.prevShootTime = this.game.engineTime;
      this.shootMagazine.curShootId++;
      if (this.stats.shootCapacity === this.shootMagazine.curShootId) {
        this.shootMagazine.curShootId = 0;
      }

      this.#makeShoot();
    }
  }

  #makeShoot() {
    const ballR = this.width/5.5 * 4;
    const ballPosShift = (this.width/2 + ballR/2) * 1.1;
    const ballX = this.kineticStatus.position.x + ballPosShift * Math.sin(this.kineticStatus.angle);
    const ballY = this.kineticStatus.position.y + ballPosShift * Math.cos(this.kineticStatus.angle);

    const tankCanonBall = new TankCanonBall(
      this.game,
      this,
      ballX,
      ballY,
      this.kineticStatus.angle,
      this.kineticStatus.speed,
      ballR
    );
    tankCanonBall.setId(this.game.addGameObject(tankCanonBall));
  }

  #kineticFrame(deltaTime) {
    if (this.controlStatus.gas) {
      this.forces.push(Vector.createByAngle(
        this.stats.enginePower,
        this.kineticStatus.angle)
      );
    }

    if (this.controlStatus.brake) {
      this.forces.push(Vector.createByAngle(
        -this.stats.enginePower,
        this.kineticStatus.angle)
      );
    }

    if (this.controlStatus.brake || this.controlStatus.gas) {
      this.physicsStats.friction = this.stats.friction * 0.7;
      this.physicsStats.normalFriction = this.stats.normalFriction * 0.7;
    } else {
      this.physicsStats.friction = this.stats.friction;
      this.physicsStats.normalFriction = this.stats.normalFriction;
    }

    if (this.controlStatus.leftTurn) {
      this.kineticStatus.angleSpeed = -this.stats.angleSpeed * deltaTime;
    }
    if (this.controlStatus.rightTurn) {
      this.kineticStatus.angleSpeed = this.stats.angleSpeed * deltaTime;
    }
    if (this.controlStatus.rightTurn === this.controlStatus.leftTurn) {
      this.kineticStatus.angleSpeed = 0;
    }
  }

  #initObject() {
    // this.#initCollideBox();
    this.#initShootMagazine();
  }

  #initShootMagazine() {
    for (let i = 0; i < this.stats.shootCapacity; i++) {
      this.shootMagazine.perShootStatus.push(-this.stats.shootReloadTime * 1100);
    }
    this.shootMagazine.prevShootTime = 0;
    this.shootMagazine.curShootId = 0;
  }
}