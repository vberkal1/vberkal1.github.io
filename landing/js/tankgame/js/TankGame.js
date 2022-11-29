class TanksGame {
  static EPS = 0.0001;

  constructor(layoutNode, width = 600, height = 400) {
    this.debug = false;
    this.layoutNode = layoutNode;
    this.mainNode = undefined;
    this.width = width;
    this.height = height;
    this.scene = {
      objects: {},
      lastObjectId: 0,
      players: {},
      lastPlayerId: 0,
      canvas: undefined,
    }
    this.isEngineUp = false;
    this.engineTime = 0;
    this.timeSpeed = 1;
    this.godForce = undefined;

    this.#initMainNode();
    this.#initCanvas();
    this.#initGodForce();
    this.#initEventsSystem();

    // this.#startEngine();
  }

  addPlayer(player) {
    this.scene.players[++this.scene.lastPlayerId] = player;
    const tank = this.#addTank(
      Math.random() * this.width,
      Math.random() * this.height,
      Math.random() * 360 - 180
    );
    player.addControllable(tank)
  }

  addGameObject(object) {
    this.scene.objects[++this.scene.lastObjectId] = object;
    return this.scene.lastObjectId;
  }

  removeGameObject(objId) {
    delete this.scene.objects[objId];
  }

  startEngine(fps = 60) {
    this.isEngineUp = true;

    let prevTime = performance.now();
    let deltaTime = 0
    const step = (timestamp = 0) => {
      deltaTime = timestamp - prevTime;
      if (deltaTime > 1000 / fps) {
        prevTime = timestamp;
        this.engineTime += deltaTime * this.timeSpeed;
        this.#rerenderScene(deltaTime * this.timeSpeed);
      }

      if (this.isEngineUp) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  pauseEngine() {
    this.isEngineUp = false;
  }

  #clearCanvas() {
    const ctx = this.scene.canvas.ctx;
    this.scene.canvas.ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  #rerenderScene(deltaTime) {
    this.#clearCanvas();
    const gameObjects = this.scene.objects;

    this.godForce.apply();
    for (const objId in gameObjects) {
      const obj = gameObjects[objId];

      obj.nextFrame(deltaTime/1000);

      if (!obj.isRenderedOnce) {
        this.mainNode.appendChild(obj.node);
        obj.isRenderedOnce = true;
      }
    }

    let outerCheckedCnt = 0;
    for (let firstObjectId in gameObjects) {
      outerCheckedCnt++;
      const firstObject = gameObjects[firstObjectId];
      let innerCheckedCnt = 0;
      for (let secondObjectId in gameObjects) {
        innerCheckedCnt++;
        const secondObject = gameObjects[secondObjectId];
        if (
          innerCheckedCnt <= outerCheckedCnt
          || !TanksGame.#isProbablyCollided(firstObject, secondObject)
        ) {
          continue;
        }

        if (
          TanksGame.#isCollided(firstObject, secondObject)
          // && !firstObject.isCollidedOnce && !secondObject.isCollidedOnce
        ) {
          firstObject.isCollidedOnce = true;
          secondObject.isCollidedOnce = true;
          TanksGame.#correctIntersection(firstObject, secondObject);
          firstObject.handleCollision(secondObject);
          secondObject.handleCollision(firstObject);
          this.#handleCollision(firstObject, secondObject);
        }
      }
    }
  }

  static #isProbablyCollided(objA, objB) {
    return Geometry.isIntersectCircles(
      new Circle(objA.kineticStatus.position, objA.simpleCollideBox.r),
      new Circle(objB.kineticStatus.position, objB.simpleCollideBox.r)
    );
  }

  static #isCollided(objA, objB) {
    const ABVectorAngle = (new Vector(
      objA.kineticStatus.position.x - objB.kineticStatus.position.x,
      objA.kineticStatus.position.y - objB.kineticStatus.position.y)
    ).getAngle();
    const BAVectorAngle = ABVectorAngle - Math.PI;

    if (
      Math.abs(ABVectorAngle - objA.kineticStatus.speed.getAngle()) > Math.PI / 2
      && Math.abs(BAVectorAngle - objB.kineticStatus.speed.getAngle()) > Math.PI / 2
    ) {
      return false;
    }

    let objAShape = objA.collideShape;
    let objBShape = objB.collideShape;

    if (objAShape instanceof Circle && objBShape instanceof Circle) {
      return true;
    }

    if (objAShape instanceof Rectangle && objBShape instanceof Rectangle) {
      return false;
    }

    if (objAShape instanceof Rectangle && objBShape instanceof Circle) {
      // [objA, objB, objAShape, objBShape] = [objB, objA, objBShape, objAShape];
      return false;
    }

    if (objAShape instanceof Circle && objBShape instanceof Rectangle) {
      return false;
    }
  }

  static #correctIntersection(objA, objB) {
    if (
      objA.collideShape instanceof Circle && objB.collideShape instanceof Circle
    ) {
      //todo fix on 0 speed
      const p1 = objA.kineticStatus.position;
      const v1 = objA.kineticStatus.speed;
      const r1 = objA.collideShape.r;

      const p2 = objB.kineticStatus.position;
      const v2 = objB.kineticStatus.speed;
      const r2 = objB.collideShape.r;


      // p1+v1*t - p2+v2*t = r1+r2
      //  ((P1x-V1x*t)-(P2x-V2x*t))^2 + ((P1y-V1y*t)-(P2y-V2y*t))^2 ==== (r1+r2)^2
      // ((a-b*t)-(c-d*t))^2 + ((j-f*t)-(g-h*t))^2 = (r+w)^2
      const
        a =	p1.x,
        b =	v1.x,
        c =	p2.x,
        d =	v2.x,
        j =	p1.y,
        f =	v1.y,
        g =	p2.y,
        h =	v2.y,
        r =	r1,
        w =	r2;

      const cc = -2*(r*w + g*j + a*c) - w*w - r*r + j*j + g*g + c*c + a*a;
      const bb = 2*(a*d + b*c + f*g + j*h - a*b - c*d - j*f - g*h);
      const aa = b*b + d*d + f*f + h*h - 2*(b*d + f*h);

      const dd = bb*bb - 4 * aa * cc;
      const sqrtDd = (dd >= 0) ? Math.sqrt(bb*bb - 4 * aa * cc) : 0;
      const t1 = (-bb + sqrtDd) / (2*aa);
      const t2 = (-bb - sqrtDd) / (2*aa);
      const t = Math.max(t1, t2) * 1.01;

      p1.addVector(Vector.multiply(v1, -t));
      p2.addVector(Vector.multiply(v2, -t));

      console.log('dist :', Geometry.getCutLen(p1, p2))
      console.log('r+r :', r1 + r2)
    }
  }

  #handleCollision(objA, objB) {
    if (
      objA.collideShape instanceof Circle && objB.collideShape instanceof Circle
    ) {
      console.log('collide handled');
      //todo fix

      const aCenter = objA.kineticStatus.position;
      const aSpeed = objA.kineticStatus.speed;
      const aR = objA.collideShape.r;

      const bCenter = objB.kineticStatus.position;
      const bSpeed = objB.kineticStatus.speed;
      const bR = objB.collideShape.r;

      console.log('objA', aCenter, aSpeed, aR);
      console.log('objB', bCenter, bSpeed, bR);

      //calc in fake system
      const bFakeSpeed = new Vector(0, 0);
      const aFakeSpeed = Vector.minusVector(aSpeed, bSpeed);
      const aFakeSpeedScalar = aFakeSpeed.getLen();
      const aFakeSpeedAngle = aFakeSpeed.getAngle();

      console.log('comp', aFakeSpeed, aFakeSpeedScalar, aFakeSpeedAngle);

      //calc fakeSpeed
      const hypot = aR + bR;
      const fakeYLeg = aCenter.y - bCenter.y;

      const hypotToYLegAngle = Geometry.getAngleHypotToCloseLeg(hypot, fakeYLeg);   //b angle
      const compSpeedToHypotAngle = aFakeSpeedAngle - hypotToYLegAngle;          //d angle

      const compFakeYSpeed = Geometry.getCloseLegByHypotToAngle(aFakeSpeedScalar, compSpeedToHypotAngle);
      const compFakeXSpeed = Geometry.getLegByLegAndHypot(compFakeYSpeed, aFakeSpeedScalar);

      // const aFakeSpeed = new Vector(compFakeXSpeed, compFakeYSpeed);
      const newBFakeSpeed = (new Vector(0, compFakeYSpeed)).rotate(hypotToYLegAngle);
      // const bFakeSpeed = Vector.minusVector(compSpeed, aFakeSpeed);
      const newAFakeSpeed = (new Vector(0, compFakeXSpeed)).rotate(hypotToYLegAngle + Math.PI/2);

      //back to old system adding fakeSpeed
      //hypotToFakeYLeg
      objA.kineticStatus.speed = Vector.addVector(newAFakeSpeed, bSpeed);
      objB.kineticStatus.speed = Vector.addVector(newBFakeSpeed, bSpeed);
    }
  }

  #getSquarePoints(obj) {
    const points = [];

    const w = obj.width;
    const h = obj.height;
    const x = obj.kineticStatus.x;
    const y = obj.kineticStatus.y;
    const objAngle = obj.kineticStatus.angle / 180 * Math.PI;

    const diagonalLength = Math.sqrt(h*h + w*w);
    const halfDiagonalLength = diagonalLength / 2;
    const hToDiagAngle = Geometry.getAngleHypotToCloseLeg(diagonalLength, h);
    const yToDiagAngle = objAngle - hToDiagAngle;
    const xToDiagAngle = 2 * hToDiagAngle + yToDiagAngle;

    return [
      new Point(
        x + halfDiagonalLength * Math.cos(yToDiagAngle),
        y + halfDiagonalLength * Math.sin(yToDiagAngle)
      ),
      new Point(
        x + halfDiagonalLength * Math.cos(xToDiagAngle),
        y + halfDiagonalLength * Math.sin(xToDiagAngle)
      ),
      new Point(
        x - halfDiagonalLength * Math.cos(yToDiagAngle),
        y - halfDiagonalLength * Math.sin(yToDiagAngle)
      ),
      new Point(
        x - halfDiagonalLength * Math.cos(xToDiagAngle),
        y - halfDiagonalLength * Math.sin(xToDiagAngle)
      ),
    ];
  }

  #initMainNode () {
    const mainNode = document.createElement('div');
    mainNode.style.width = this.width + 'px';
    mainNode.style.height = this.height + 'px';
    mainNode.style.backgroundColor = '#d2d2d2';
    mainNode.style.outline = 'none';
    mainNode.style.margin = '0 auto';
    mainNode.style.position = 'relative';
    mainNode.style.userSelect = 'none';
    mainNode.style.overflow = 'hidden';
    mainNode.tabIndex = 1;
    mainNode.oncontextmenu = function() {
      return false;
    }

    this.mainNode = mainNode;
    this.layoutNode.appendChild(mainNode);

    this.mainNodeBound = this.mainNode.getBoundingClientRect();
  }

  #initCanvas() {
    const canvas = document.createElement('canvas');
    canvas.style.width = this.width + 'px';
    canvas.style.height = this.height + 'px';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '999';
    canvas.style.pointerEvents = 'none';
    canvas.width = this.width;
    canvas.height = this.height;

    this.mainNode.appendChild(canvas);
    this.scene.canvas = {
      node: canvas,
      ctx: canvas.getContext("2d")
    }
  }

  #initEventsSystem() {
    const mainNode = this.mainNode;
    mainNode.focus();
    mainNode.onkeydown
      = mainNode.onkeyup
      = mainNode.onkeydown
      = mainNode.onmousedown
      = mainNode.onmouseup
      = mainNode.onmousemove
      = mainNode.onclick
      = this.#eventsHandler.bind(this);
  }

  #initGodForce() {
    this.godForce = new GodForce(this);
  }

  #eventsHandler(e) {
    switch (e.type) {
      case 'click':

        break;
      case 'keydown':
        switch (e.code) {
          case 'KeyP':
            if (this.isEngineUp) {
              this.pauseEngine();
            } else {
              this.startEngine(60);
            }
            break;
          case 'Minus':
            this.timeSpeed /= 1.1
            tanksGame.addPlayer(playerA)
            break;
          case 'Equal':
            this.timeSpeed *= 1.1
            break;
        }
        break;
      case 'keyup':

        break;
    }

    if (e.type === 'mouseup' || e.type === 'mousemove') {
      this.godForce.handleControl(e);
    }

    for (const key in this.scene.players) {
      this.scene.players[key].handleControl(e);
    }
  }

  #addTank(x = this.height / 2, y = this.width / 2, angle = 0) {
    const tank = new Tank(this, x, y, angle);
    tank.setId(this.addGameObject(tank));
    return tank;
  }
}