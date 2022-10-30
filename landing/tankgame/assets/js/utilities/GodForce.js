class GodForce {
  constructor(game) {
    this.game = game;
    this.isOn = false;
    this.gameObject = undefined;
    this.curEvent = undefined;
  }

  isEnabled() {
    return this.isOn;
  }

  enable(gameObject, e) {
    this.gameObject = gameObject;
    this.curEvent = e;
    this.isOn = true;
  }

  update(e) {
    this.curEvent = e;
  }

  disable() {
    this.gameObject = undefined;
    this.curEvent = undefined;
    this.isOn = false;
  }

  apply() {
    if (!this.isOn) return;
    const gamePosition = this.game.mainNode.getBoundingClientRect();
    const inGameXEvent = this.curEvent.x - gamePosition.x;
    const inGameYEvent = this.game.height - (this.curEvent.y - gamePosition.y);
    const force = new Vector(
      (inGameXEvent - this.gameObject.kineticStatus.position.x) * 10,
      (inGameYEvent - this.gameObject.kineticStatus.position.y) * 10
    )
    this.gameObject.forces.push(force)
  }

  handleControl(e) {
    if (e.type === 'mousedown') {
      this.enable(e);
    }

    if (this.isOn && e.type === 'mousemove') {
      this.update(e);
    }

    if (this.isOn && e.type === 'mouseup') {
      this.disable();
    }
  }
}