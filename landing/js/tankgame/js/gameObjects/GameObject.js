class GameObject {
  constructor(game, width, height, x, y, angle, speed, collideShape, sprite) {
    this.game = game;
    this.sprite = sprite;
    this.width = width;
    this.height = height;
    this.simpleCollideBox = undefined;
    this.collideShape = collideShape;
    this.physicsStats = {
      mass: 1,
      friction: 0,
      normalFriction: 0,
    }
    this.kineticStatus = {
      position: new Point(x, y),
      speed: speed,
      angle: angle,
      angleSpeed: 0
    }
    this.forces = [];
    this.#initNode();
    this.#initSimpleCollider();
    this.#initEventsSystem();
  }

  setId(id) {
    this.id = id;
  }

  destroy() {
    this.node.remove();
    this.game.removeGameObject(this.id);
  }

  rerenderFrame() {
    //relocate
    if (this.game.debug) {
      this.rerenderCanvasFrame();
    }

    this.node.style.left = this.kineticStatus.position.x - this.width/2 + 'px';
    this.node.style.bottom = this.kineticStatus.position.y - this.height/2 + 'px';
    this.node.style.transform = `rotate(${this.kineticStatus.angle*180/Math.PI}deg)`;
  }

  #initSimpleCollider() {
    this.simpleCollideBox = new Circle(new Point(0,0), Math.max(this.width,this.height)/2)
  }

  #initNode() {
    const node = document.createElement('div');
    node.style.width = this.width + 'px';
    node.style.height = this.height + 'px';
    node.style.position = 'absolute';
    if (this.sprite) {
      node.style.backgroundImage = `url(${this.sprite})`;
    } else {
      node.style.backgroundColor = '#000000';
    }
    node.style.backgroundSize = `100%`;
    node.style.left = this.kineticStatus.x - this.width/2 + 'px';
    node.style.bottom = this.kineticStatus.y - this.height/2 +'px';
    this.node = node;
  }

  nextFrame(deltaTime) {
    this.kineticStatusFrame(deltaTime);
    // this.#collideBoxFrame(deltaTime);
    this.rerenderFrame();
    this.forces = [];
  }

  kineticStatusFrame(deltaTime) {
    //angle
    this.kineticStatus.angle += this.kineticStatus.angleSpeed;

    let forcesSum = Physics.getForcesSum(this.forces);
    let newAcc = Vector.divide(forcesSum, this.physicsStats.mass);
    let newSpeed = Vector.addVector(this.kineticStatus.speed, Vector.multiply(newAcc, deltaTime))

    //friction
    const xSign = Math.sign(newSpeed.x);
    const ySign = Math.sign(newSpeed.y);
    if (
      newSpeed.x * xSign > TanksGame.EPS
      || newSpeed.y * ySign > TanksGame.EPS
      && (
        this.physicsStats.friction !== 0
        || this.physicsStats.normalFriction !== 0
      )
    ) {
      const relSpeed = Vector.createByVectorAndRotate(newSpeed, -this.kineticStatus.angle + Math.PI/2);

      let relXFrictionForce = 0;
      if (this.physicsStats.friction !== 0) {
        const relXSign = Math.sign(relSpeed.x);
        if (relSpeed.x * relXSign > TanksGame.EPS) {
          relXFrictionForce = -relXSign * Math.min(
            this.physicsStats.friction,
            relSpeed.x * relXSign * this.physicsStats.mass / deltaTime
          );
        }
      }

      //normalFriction
      let relYFrictionForce = 0;
      if (this.physicsStats.normalFriction !== 0) {
        const relYSign = Math.sign(relSpeed.y) || 1;
        if (relSpeed.y * relYSign > TanksGame.EPS) {
          relYFrictionForce = -relYSign * Math.min(
            this.physicsStats.normalFriction,
            relSpeed.y * relYSign * this.physicsStats.mass / deltaTime
          );
        }
      }

      const frictionForce = (new Vector(relXFrictionForce, relYFrictionForce)).rotate(this.kineticStatus.angle - Math.PI/2);
      this.forces.push(frictionForce);
      forcesSum = Physics.getForcesSum([forcesSum, frictionForce]);
      newAcc = Vector.divide(forcesSum, this.physicsStats.mass);
      newSpeed = Vector.addVector(this.kineticStatus.speed, Vector.multiply(newAcc, deltaTime))
    }

    //acceleration
    this.kineticStatus.acceleration = newAcc;

    //speed
    this.kineticStatus.speed = newSpeed;

    //position
    this.kineticStatus.position.addVector(
      Vector.multiply(this.kineticStatus.speed, deltaTime)
    );
  }

  rerenderCanvasFrame() {
    const ctx = this.game.scene.canvas.ctx;
    const ctxH = ctx.canvas.height;
    const renderScale = 0.1;
    ctx.lineWidth = 3;

    //center
    const center = this.kineticStatus.position;
    // ctx.fillStyle = "rgba(0,0,0)"
    // ctx.fillRect(center.x - 1, ctxH-center.y - 1,3,3);

    // //front view
    // const frontEnd = Point.addVector(center, Vector.createByAngle(20, this.kineticStatus.angle));
    // ctx.strokeStyle = "rgb(0,0,0)"
    // ctx.beginPath();
    // ctx.moveTo(center.x, ctxH-center.y);
    // ctx.lineTo(frontEnd.x, ctxH-frontEnd.y);
    // ctx.closePath();
    // ctx.stroke();

    ctx.strokeStyle = "rgb(83,145,74, 0.8)"
    for (const force of this.forces) {
      const endPoint = Point.addVector(center, Vector.multiply(force, renderScale));
      ctx.beginPath();
      ctx.moveTo(center.x, ctxH-center.y);
      ctx.lineTo(endPoint.x, ctxH-endPoint.y);
      ctx.closePath();
      ctx.stroke();
    }

    //speed
    const speedEnd = Point.addVector(center, Vector.multiply(this.kineticStatus.speed, renderScale));
    ctx.strokeStyle = "rgba(0,20,255, 0.8)"
    ctx.beginPath();
    ctx.moveTo(center.x, ctxH-center.y);
    ctx.lineTo(speedEnd.x, ctxH-speedEnd.y);
    ctx.closePath();
    ctx.stroke();

    //acc
    const accEnd = Point.addVector(center, Vector.multiply(this.kineticStatus.acceleration, renderScale));
    ctx.strokeStyle = "rgb(255,0,0, 0.8)"
    ctx.beginPath();
    ctx.moveTo(center.x, ctxH-center.y);
    ctx.lineTo(accEnd.x, ctxH-accEnd.y);
    ctx.closePath();
    ctx.stroke();
  }

  #initEventsSystem() {
    const node = this.node;
    node.onmousedown
      = node.onmouseup
      = node.onmousemove
      = this.#eventsHandler.bind(this);
  }

  #eventsHandler(e) {
    if (e.type === 'mousedown') {
      this.game.godForce.enable(this, e);
    }
  }
}
