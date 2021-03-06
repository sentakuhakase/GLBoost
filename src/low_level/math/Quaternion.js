import GLBoost from '../../globals';
import Vector3 from './Vector3';
import Vector4 from './Vector4';
import MathUtil from './MathUtil';

export default class Quaternion {

  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  isEqual(vec) {
    if (this.x === vec.x && this.y === vec.y && this.z === vec.z && this.w === vec.w) {
      return true;
    } else {
      return false;
    }
  }

  get className() {
    return this.constructor.name;
  }

  clone() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  static invert(quat) {
    return new Quaternion(-quat.x, -quat.y, -quat.z, quat.w).multiply(1.0/(quat.x*quat.x + quat.y*quat.y + quat.z*quat.z + quat.w*quat.w));
  }

  static qlerp(lhq, rhq, ratio) {

    var q = new Quaternion(0, 0, 0, 1);
    var qr = lhq.w * rhq.w + lhq.x * rhq.x + lhq.y * rhq.y + lhq.z * rhq.z;
    var ss = 1.0 - qr * qr;

    if (ss === 0.0) {
      q.w = lhq.w;
      q.x = lhq.x;
      q.y = lhq.y;
      q.z = lhq.z;

      return q;
    } else {

      if (qr > 1) {
        qr = 0.999;
      } else if (qr < -1) {
        qr = -0.999;
      }

      let ph = Math.acos(qr);
      let s2;
      if(qr < 0.0 && ph > Math.PI / 2.0){
        qr = - lhq.w * rhq.w - lhq.x * rhq.x - lhq.y * rhq.y - lhq.z * rhq.z;
        ph = Math.acos(qr);
        s2 = -1 * Math.sin(ph * ratio) / Math.sin(ph);
      } else {
        s2 = Math.sin(ph * ratio) / Math.sin(ph);
      }
      let s1 = Math.sin(ph * (1.0 - ratio)) / Math.sin(ph);

      q.x = lhq.x * s1 + rhq.x * s2;
      q.y = lhq.y * s1 + rhq.y * s2;
      q.z = lhq.z * s1 + rhq.z * s2;
      q.w = lhq.w * s1 + rhq.w * s2;

      return q;
    }
  }

  axisAngle(axisVec3, angle) {
    var radian = 0;
    if (GLBoost["VALUE_ANGLE_UNIT"] === GLBoost.DEGREE) {
      radian = MathUtil.degreeToRadian(angle);
    } else {
      radian = angle;
    }
    var halfAngle = 0.5 * radian;
    var sin = Math.sin(halfAngle);

    var axis = Vector3.normalize(axisVec3);
    this.w = Math.cos(halfAngle);
    this.x = sin * axis.x;
    this.y = sin * axis.y;
    this.z = sin * axis.z;

    return this;
  }

  static axisAngle(axisVec3, angle) {
    var radian = 0;
    if (GLBoost["VALUE_ANGLE_UNIT"] === GLBoost.DEGREE) {
      radian = MathUtil.degreeToRadian(angle);
    } else {
      radian = angle;
    }
    var halfAngle = 0.5 * radian;
    var sin = Math.sin(halfAngle);

    var axis = Vector3.normalize(axisVec3);
    return new Quaternion(
      sin * axis.x,
      sin * axis.y,
      sin * axis.z,
      Math.cos(halfAngle));
  }

  add(q) {
    this.x += q.x;
    this.y += q.y;
    this.z += q.z;
    this.w += q.w;

    return this;
  }

  multiply(q) {
    let result = new Quaternion(0, 0, 0, 1);
    result.w = this.w*q.w - this.x*q.x - this.y*q.y - this.z*q.z;
    result.x = this.w*q.x + this.x*q.w + this.y*q.z - this.z*q.y;
    result.y = this.w*q.y + this.y*q.w + this.x*q.z - this.z*q.x;
    result.z = this.w*q.z + this.z*q.w + this.x*q.y - this.y*q.x;
    this.x = result.x;
    this.y = result.y;
    this.z = result.z;
    this.w = result.w;
    
    return this;
  }

  static multiply(q1, q2) {
    let result = new Quaternion(0, 0, 0, 1);
    result.w = q1.w*q2.w - q1.x*q2.x - q1.y*q2.y - q1.z*q2.z;
    result.x = q1.w*q2.x + q1.x*q2.w + q1.y*q2.z - q1.z*q2.y;
    result.y = q1.w*q2.y + q1.y*q2.w + q1.x*q2.z - q1.z*q2.x;
    result.z = q1.w*q2.z + q1.z*q2.w + q1.x*q2.y - q1.y*q2.x;
    return result;
  }

  static fromMatrix(m) {
    
    let q = new Quaternion();
    let tr = m.m00 + m.m11 + m.m22;

    if (tr > 0) { 
      let S = 0.5 / Math.sqrt(tr+1.0);
      q.w = 0.25 / S;
      q.x = (m.m21 - m.m12) * S;
      q.y = (m.m02 - m.m20) * S; 
      q.z = (m.m10 - m.m01) * S; 
    } else if ((m.m00 > m.m11) && (m.m00 > m.m22)) { 
      let S = Math.sqrt(1.0 + m.m00 - m.m11 - m.m22) * 2;
      q.w = (m.m21 - m.m12) / S;
      q.x = 0.25 * S;
      q.y = (m.m01 + m.m10) / S; 
      q.z = (m.m02 + m.m20) / S; 
    } else if (m.m11 > m.m22) { 
      let S = Math.sqrt(1.0 + m.m11 - m.m00 - m.m22) * 2;
      q.w = (m.m02 - m.m20) / S;
      q.x = (m.m01 + m.m10) / S; 
      q.y = 0.25 * S;
      q.z = (m.m12 + m.m21) / S; 
    } else { 
      let S = Math.sqrt(1.0 + m.m22 - m.m00 - m.m11) * 2;
      q.w = (m.m10 - m.m01) / S;
      q.x = (m.m02 + m.m20) / S;
      q.y = (m.m12 + m.m21) / S;
      q.z = 0.25 * S;
    }

    return q;
  }
/*
  static fromMatrix(m) {
    let fTrace = m.m[0] + m.m[4] + m.m[8];
    let fRoot;
    let q = new Quaternion();
    if ( fTrace > 0.0 ) {
      // |w| > 1/2, may as well choose w > 1/2
      fRoot = Math.sqrt(fTrace + 1.0);  // 2w
      q.w = 0.5 * fRoot;
      fRoot = 0.5/fRoot;  // 1/(4w)
      q.x = (m.m[5]-m.m[7])*fRoot;
      q.y = (m.m[6]-m.m[2])*fRoot;
      q.z = (m.m[1]-m.m[3])*fRoot;
    } else {
      // |w| <= 1/2
      let i = 0;
      if ( m.m[4] > m.m[0] )
        i = 1;
      if ( m.m[8] > m.m[i*3+i] )
        i = 2;
      let j = (i+1)%3;
      let k = (i+2)%3;
      fRoot = Math.sqrt(m.m[i*3+i]-m.m[j*3+j]-m.m[k*3+k] + 1.0);
      
      let setValue = function(q, i, value) {
        switch (i) {
          case 0: q.x = value; break;
          case 1: q.y = value; break;
          case 2: q.z = value; break;
        }
      }

      setValue(q, i, 0.5 * fRoot); //      q[i] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot;
      q.w = (m.m[j*3+k] - m.m[k*3+j]) * fRoot;

      setValue(q, j, (m.m[j*3+i] + m.m[i*3+j]) * fRoot); //      q[j] = (m.m[j*3+i] + m.m[i*3+j]) * fRoot;
      setValue(q, k, (m.m[k*3+i] + m.m[i*3+k]) * fRoot); //      q[k] = (m.m[k*3+i] + m.m[i*3+k]) * fRoot;
    }

    return q;
  }
*/

  static fromPosition(vec3) {
    let q = new Quaternion(vec3.x, vec3.y, vec3.z, 0);
    return q;
  }

  at(i) {
    switch (i%4) {
    case 0: return this.x;
    case 1: return this.y;
    case 2: return this.z;
    case 3: return this.w;
    }
  }

  setAt(i, val) {
    switch (i%4) {
    case 0: this.x = val; break;
    case 1: this.y = val; break;
    case 2: this.z = val; break;
    case 3: this.w = val; break;
    }
  }

  normalize() {
    let norm = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w);
    this.x /= norm;
    this.y /= norm;
    this.z /= norm;
    this.w /= norm;
    return this;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ')';
  }
}

GLBoost["Quaternion"] = Quaternion;
