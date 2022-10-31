class Player {
  constructor(controlConfig) {
    this.controlReversed = Helpers.flipObj(controlConfig);
    this.controllable = [];
  }

  addControllable(obj) {
    this.controllable.push(obj);
  }

  handleControl(e) {
    if (!this.controlReversed[e.code]) {
      return;
    }
    for (const obj of this.controllable) {
      obj.handleControl({
        type: e.type,
        code: this.controlReversed[e.code]
      });
    }
  }
}

class Control {
  constructor(gas, break_, leftTurn, rightTurn, shoot) {
    this.gas = gas;
    this.break = break_;
    this.leftTurn = leftTurn;
    this.rightTurn = rightTurn;
    this.shoot = shoot;
  }
}