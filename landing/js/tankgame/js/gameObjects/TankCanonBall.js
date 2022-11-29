class TankCanonBall extends GameObject {
  constructor(
    game,
    shoutedBy,
    x,
    y,
    angle,
    throwSpeed,
    r,
    spriteHref = 'js/tankgame/img/tankCannonBall.png',
  ) {

    const startSpeed = 20;
    const speed = (Vector.createByAngle(startSpeed, angle)).addVector(throwSpeed);

    spriteHref = undefined;
    super(game, r, r, x, y, angle, speed, new Circle(new Point(0,0), r/2), spriteHref);

    this.stats = {
      shoutedBy: shoutedBy,
      speed: startSpeed,
      lifeTime: 100
    }
    this.lifeTimeStatus = {
      leftLifeTime: this.stats.lifeTime
    }

    this.#initObject();
  }

  setId(id) {
    super.setId(id);
    this.node.innerHTML = this.id;
  }

  nextFrame(deltaTime) {
    this.#lifeTimeFrame(deltaTime);
    super.nextFrame(deltaTime);

  }

  handleCollision(collidedObj) {
    if (this.game.debug) {
      this.node.style.backgroundColor = '#ff0000';
    }
    // this.destroy();
    // collidedObj.destroy();
  }

  #lifeTimeFrame(deltaTime) {
    this.lifeTimeStatus.leftLifeTime -= deltaTime;
    if (this.lifeTimeStatus.leftLifeTime < 0) {
      this.destroy();
    }
  }

  #initObject() {
    this.node.style.borderRadius = '50%';
    this.node.style.color = 'white';
    this.kineticStatus.speed.addScalar(this.stats.speed)
    // this.#initCollideBox();
  }
}