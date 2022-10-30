class Physics {
  static circleInertia(m, r, w) {
    return 1.25*m*r*r*w*w;
  }

  static rectangleInertia(m, a, b, w) {
    return 0.0416666666666667*m*(a*a+b*b)*w*w;
  }

  static getForcesSum(forces = []) {
    let sumF = new Vector();
    for (let force of forces) {
      sumF.addVector(force);
    }
    return sumF;
  }

  static getAccByForces(m, forces = []) {
    return Physics.getForcesSum(forces).divide(m);
  }
}