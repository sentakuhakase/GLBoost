/* @flow */

import GLBoost from '../../globals';

type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array |
Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;

export default class Vector2 {
  v: TypedArray;

  constructor(x:number|TypedArray, y?:number) {
    if (ArrayBuffer.isView(x)) {
      this.v = ((x:any):TypedArray);
      return;
    } else {
      this.v = new Float32Array(2)
    }

    this.x = ((x:any):number);
    this.y = ((y:any):number);
  }

  get className() {
    return this.constructor.name;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  multiply(val:number) {
    this.x *= val;
    this.y *= val;

    return this;
  }

  static multiply(vec2:Vector2, val:number) {
    return new Vector2(vec2.x * val, vec2.y * val);
  }

  get x() {
    return this.v[0];
  }

  set x(x:number) {
    this.v[0] = x;
  }

  get y() {
    return this.v[1];
  }

  set y(y:number) {
    this.v[1] = y;
  }

  get raw() {
    return this.v;
  }
}

GLBoost["Vector2"] = Vector2;
