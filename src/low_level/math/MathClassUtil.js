import GLBoost from '../../globals';
import Vector2 from './Vector2';
import Vector3 from './Vector3';
import Vector4 from './Vector4';
import Quaternion from './Quaternion';
import Matrix33 from './Matrix33';
import Matrix44 from './Matrix44';

export default class MathClassUtil {
  constructor() {

  }


  static arrayToVector(element) {
    if (Array.isArray(element)) {
      if(typeof(element[3]) !== 'undefined') {
        return new Vector4(element[0], element[1], element[2], element[3]);
      } else if (typeof(element[2]) !== 'undefined') {
        return new Vector3(element[0], element[1], element[2]);
      } else {
        return new Vector2(element[0], element[1]);
      }
    } else {
      return element;
    }
  }

  static arrayToVectorOrMatrix(element) {
    if (Array.isArray(element)) {
      if(typeof(element[15]) !== 'undefined') {
        return new Matrix44(element);
      } else if(typeof(element[8]) !== 'undefined') {
        return new Matrix33(element);
      } else if(typeof(element[3]) !== 'undefined') {
        return new Vector4(element[0], element[1], element[2], element[3]);
      } else if (typeof(element[2]) !== 'undefined') {
        return new Vector3(element[0], element[1], element[2]);
      } else {
        return new Vector2(element[0], element[1]);
      }
    } else {
      return element;
    }
  }

  static cloneOfMathObjects(element) {
    if(element instanceof Matrix44) {
      return element.clone();
    } else if (element instanceof Matrix33) {
      return element.clone();
    } else if (element instanceof Vector4) {
      return element.clone();
    } else if (element instanceof Vector3) {
      return element.clone();
    } else if (element instanceof Vector2) {
      return element.clone();
    } else {
      return element;
    }

  }

  static arrayToQuaternion(element) {
    if (Array.isArray(element)) {
      if(typeof(element[3]) !== 'undefined') {
        return new Quaternion(element[0], element[1], element[2], element[3]);
      }
    } else {
      return element;
    }
  }

  static makeSubArray(array, componentN) {
    if (componentN === 4) {
      return [array[0], array[1], array[2], array[3]];
    } else if (componentN === 3) {
      return [array[0], array[1], array[2]];
    } else if (componentN === 2) {
      return [array[0], array[1]];
    } else {
      return array[0];
    }
  }

  static vectorToArray(element) {
    if(element instanceof Vector2) {
      return [element.x, element.y];
    } else if (element instanceof Vector3) {
      return [element.x, element.y, element.z];
    } else if (element instanceof Vector4 || element instanceof Quaternion) {
      return [element.x, element.y, element.z, element.w];
    } else {
      return element;
    }
  }

  static compomentNumberOfVector(element) {
    if(element instanceof Vector2) {
      return 2;
    } else if (element instanceof Vector3) {
      return 3;
    } else if (element instanceof Vector4 || element instanceof Quaternion) {
      return 4;
    } else if (Array.isArray(element)) {
      return element.length;
    } else {
      return 0;
    }
  }

  // values range must be [-1, 1]
  static packNormalizedVec4ToVec2(x, y, z, w, criteria) {
    let v0 = 0.0;
    let v1 = 0.0;
    
    x = (x + 1)/2.0;
    y = (y + 1)/2.0;
    z = (z + 1)/2.0;
    w = (w + 1)/2.0;

    let ir = Math.floor(x*(criteria-1.0));
    let ig = Math.floor(y*(criteria-1.0));
    let irg = ir*criteria + ig;
    v0 = irg / criteria; 

    let ib =  Math.floor(z*(criteria-1.0));
    let ia =  Math.floor(w*(criteria-1.0));
    let iba = ib*criteria + ia;
    v1 =iba / criteria; 
    
    return [v0, v1];
  }

  static unProject(windowPosVec3, inversePVMat44, viewportVec4, zNear, zFar) {
    const input = new Vector4(
      (windowPosVec3.x - viewportVec4.x) / viewportVec4.z * 2 - 1.0,
      (windowPosVec3.y - viewportVec4.y) / viewportVec4.w * 2 - 1.0,
//      (windowPosVec3.z - zNear) / (zFar - zNear),
      2 * windowPosVec3.z - 1.0,
      1.0
    );

    const PVMat44 = inversePVMat44;//Matrix44.transpose(inversePVMat44);

    const out = PVMat44.multiplyVector(input);
//    const a = input.x * PVMat44.m03 + input.y * PVMat44.m13 + input.z * PVMat44.m23 + PVMat44.m33;
//    const a = input.x * PVMat44.m30 + input.y * PVMat44.m31 + input.z * PVMat44.m32 + PVMat44.m33;

    if (out.w === 0) {
      console.warn("Zero division!");
    }

    const output = new Vector3(out.multiply(1/out.w));

    return output;
  }
}

GLBoost["MathClassUtil"] = MathClassUtil;
