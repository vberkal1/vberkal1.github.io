class Geometry {

  static isIntersectCircles(circleA, circleB) {
    const xDel = circleA.point.x - circleB.point.x;
    const yDel = circleA.point.y - circleB.point.y;
    return xDel * xDel + yDel * yDel < (circleA.r + circleB.r) * (circleA.r + circleB.r);
  }

  static isIntersectRectangleAndCircle(rectangle, circle) {

  }

  static isIntersectRectangles(rectangleA, rectangleB) {

  }

  static isIntersectCuts (cutA, cutB) {
    const a = cutA.pointA;
    const b = cutA.pointB;
    const c = cutB.pointA;
    const d = cutB.pointB;
    return Geometry.isIntersectCuts1D(a.x, b.x, c.x, d.x)
      && Geometry.isIntersectCuts1D (a.y, b.y, c.y, d.y)
      && Geometry.triangleArea(a,b,c) * Geometry.triangleArea(a,b,d) <= 0
      && Geometry.triangleArea(c,d,a) * Geometry.triangleArea(c,d,b) <= 0;
  }

  static triangleArea (pointA, pointB, pointC) {
    return (pointB.x - pointA.x) * (pointC.y - pointA.y) - (pointB.y - pointA.y) * (pointC.x - pointA.x);
  }

  static isIntersectCuts1D (a,b,c,d) {
    if (a > b)  [a,b] = [b,a];
    if (c > d)  [c,d] = [d,c];
    if (Math.max(a,c) <= Math.min(b,d)) {
      return true;
    }
  }

  static getCutLen(pointA, pointB) {
    return Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y))
  }

  static getAngleHypotToCloseLeg(hypotLength, legLength) {
    return Math.acos(legLength / hypotLength);
  }

  static getCloseLegByHypotToAngle(hypotLength, angle) {
    return Math.cos(angle) * hypotLength;
  }

  static getLegByLegAndHypot(leg, hypot) {
    return Math.sqrt(hypot*hypot - leg*leg)
  }
}

class Point {
  static addVector(point, vector) {
    return new Point(point.x + vector.x, point.y + vector.y);
  }

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  addVector(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }
}

class Vector {
  static divide(vector, number) {
    return new Vector(vector.x / number, vector.y / number);
  }

  static multiply(vector, number) {
    return new Vector(vector.x * number, vector.y * number);
  }

  static createByAngle(val, angle) {
    return (new Vector(0, val))
      .rotate(angle)
  }

  static addVector(vectorA, vectorB) {
    return new Vector(vectorA.x + vectorB.x, vectorA.y + vectorB.y);
  }

  static minusVector(vectorA, vectorB) {
    return new Vector(vectorA.x - vectorB.x, vectorA.y - vectorB.y);
  }

  static addScalar(vector, number) {
    const len = vector.getLen();
    const resizeCoef = (len + number) / len;
    return new Vector(
      vector.x * resizeCoef,
      vector.y * resizeCoef
    );
  }

  static createByVectorAndRotate(vect, angle) {
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const x = cos*vect.x - sin*vect.y;
    const y = sin*vect.x + cos*vect.y;
    return new Vector(x,y);
  }

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  divide(number) {
    this.x /= number;
    this.y /= number;
    return this;
  }

  getLen() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  multiply(number) {
    this.x *= number;
    this.y *= number;
    return this;
  }

  rotate(angle) {
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const oldX = this.x;
    this.x = cos*this.x - sin*this.y;
    this.y = sin*oldX + cos*this.y;
    return this;
  }

  addVector(vectorB) {
    this.x += vectorB.x;
    this.y += vectorB.y;
    return this;
  }

  minusVector(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  addScalar(number) {
    const len = this.getLen();
    const resizeKf = (len + number) / len;
    this.x = this.x * resizeKf;
    this.y = this.y * resizeKf;
    return this;
  }

  getAngle() {
    return Math.atan(this.x / this.y);
  }
}

class Cut {
  constructor(pointA, pointB) {
    this.pointA = pointA;
    this.pointB = pointB;
  }
}

class Circle {
  constructor(point, r) {
    this.point = point;
    this.r = r;
  }
}

class Rectangle {
  constructor(
    pointA = new Point(),
    pointB = new Point(),
    pointC = new Point(),
    pointD = new Point()
  ) {
    this.pointA = pointA;
    this.pointB = pointB;
    this.pointC = pointC;
    this.pointD = pointD;
  }
}

