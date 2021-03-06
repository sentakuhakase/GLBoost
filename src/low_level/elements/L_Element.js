/* @flow */

import Vector2 from '../math/Vector2';
import Vector3 from '../math/Vector3';
import Vector4 from '../math/Vector4';
import Quaternion from '../math/Quaternion';
import Matrix33 from '../math/Matrix33';
import Matrix44 from '../math/Matrix44';
import MathClassUtil from '../math/MathClassUtil';
import MathUtil from '../math/MathUtil';
import GLBoostObject from '../core/GLBoostObject';
import AnimationUtil from '../../low_level/misc/AnimationUtil';
import type GLBoostSystem from '../core/GLBoostSystem';

export default class L_Element extends GLBoostObject {
  _animationLine: Object;
  _currentAnimationInputValues: Object;
  _activeAnimationLineName: string | null;
  _translate: Vector3;
  _rotate: Vector3;
  _scale: Vector3;
  _quaternion: Quaternion;
  _matrix: Matrix44;
  _invMatrix: Matrix44;
  _updateCountAsElement: number;
  _is_trs_matrix_updated: boolean;
  _is_translate_updated: boolean;
  _is_scale_updated: boolean;
  _is_quaternion_updated: boolean;
  _is_euler_angles_updated: boolean;
  _is_inverse_trs_matrix_updated: boolean;


  constructor(glBoostSystem: GLBoostSystem, toRegister: boolean = true) {
    super(glBoostSystem, toRegister);

    // Live (Static or Animation)
    this._translate = Vector3.zero();
    this._scale = new Vector3(1, 1, 1);
    this._rotate = Vector3.zero();
    this._quaternion = new Quaternion(0, 0, 0, 1);
    this._matrix = Matrix44.identity();
    this._invMatrix = Matrix44.identity();

//    this._finalMatrix = Matrix44.identity();

    this._updateCountAsElement = 0;
    this._animationLine = {};
    this._currentAnimationInputValues = {};
    this._activeAnimationLineName = null;

    this._is_trs_matrix_updated = true;
    this._is_translate_updated = true;
    this._is_scale_updated = true;
    this._is_quaternion_updated = true;
    this._is_euler_angles_updated = true;
    this._is_inverse_trs_matrix_updated = true;
  }


  get updateCountAsElement() {
    return this._updateCountAsElement;
  }

  _needUpdate() {
    this._updateCountAsElement++;
  }

  _getAnimatedTransformValue(value, animation, type) {
    if (typeof animation !== 'undefined' && animation[type] && value !== null && value !== void 0) {
      return AnimationUtil.interpolate(animation[type].input, animation[type].output, value, animation[type].outputComponentN, animation[type].interpolationMethod);
    } else {
      //  console.warn(this._instanceName + 'doesn't have ' + type + ' animation data. GLBoost returned default ' + type + ' value.');
      return null;
    }
  }

  _getCurrentAnimationInputValue(inputName: string): number | null {
    let value = this._currentAnimationInputValues[inputName];
    if (typeof(value) === 'number') {
      return value;
    } else {
      return null;
    }
  }

  setAnimationAtLine(lineName: string, attributeName: string, inputArray: Array<any>, outputArray: Array<any>, interpolationMethod: string) {
    var outputComponentN = 0;
    if (outputArray[0] instanceof Vector2) {
      outputComponentN = 2;
    } else if (outputArray[0] instanceof Vector3) {
      outputComponentN = 3;
    } else if (outputArray[0] instanceof Vector4) {
      outputComponentN = 4;
    } else if (outputArray[0] instanceof Quaternion) {
      outputComponentN = 4;
    } else {
      outputComponentN = 1;
    }
    if (!this._animationLine[lineName]) {
      this._animationLine[lineName] = {};
    }
    this._animationLine[lineName][attributeName] = {
      input: inputArray,
      output: outputArray,
      outputAttribute: attributeName,
      outputComponentN: outputComponentN,
      interpolationMethod: interpolationMethod
    };
  }

  hasAnimation(lineName: string) {
    if (this._animationLine[lineName]) {
      return true;
    } else {
      return false;
    }
  }

  getStartInputValueOfAnimation(lineName: string) {
    let inputLine = this._animationLine[lineName];
    let latestInputValue = Number.MAX_VALUE;
    if (typeof inputLine === 'undefined') {
      return latestInputValue;
    }
    for (let attributeName in inputLine) {
      let inputValueArray = inputLine[attributeName].input;
      let inputLatestValueAtThisAttribute = inputValueArray[0];
      if (inputLatestValueAtThisAttribute < latestInputValue) {
        latestInputValue = inputLatestValueAtThisAttribute;
      }
    }
    return latestInputValue;
  }

  getEndInputValueOfAnimation(lineName: string) {
    let inputLine = this._animationLine[lineName];
    let latestInputValue = - Number.MAX_VALUE;
    if (typeof inputLine === 'undefined') {
      return latestInputValue;
    }
    for (let attributeName in inputLine) {
      let inputValueArray = inputLine[attributeName].input;
      let inputLatestValueAtThisAttribute = inputValueArray[inputValueArray.length - 1];
      if (inputLatestValueAtThisAttribute > latestInputValue) {
        latestInputValue = inputLatestValueAtThisAttribute;
      }
    }
    return latestInputValue;
  }

  /**
   * [en] Set animation input value (for instance frame value), This value affect all child elements in this scene graph (recursively).<br>
   * [ja] アニメーションのための入力値（例えばフレーム値）をセットします。この値はシーングラフに属する全ての子孫に影響します。
   * @param {string} inputName [en] inputName name of input value. [ja] 入力値の名前
   * @param {number|Vector2|Vector3|Vector4|*} inputValue [en] input value of animation. [ja] アニメーションの入力値
   */
  setCurrentAnimationValue(inputName: string, inputValue: any) {
    this._setDirtyToAnimatedElement(inputName);
    this._currentAnimationInputValues[inputName] = inputValue;
  }

  removeCurrentAnimationValue(inputName: string) {
    delete this._currentAnimationInputValues[inputName];
  }

  setActiveAnimationLine(lineName: string) {
    this._activeAnimationLineName = lineName;
  }

  set translate(vec: Vector3) {
    this._translate = vec.clone();
    this._is_translate_updated = true;
    this._is_trs_matrix_updated = false;
    this._is_inverse_trs_matrix_updated = false;

    this.__updateTransform();
  }

  getTranslateNotAnimated() {
    if (this._is_translate_updated) {
      return this._translate.clone();
    } else if (this._is_trs_matrix_updated) {
      this._translate.x = this._matrix.m03;
      this._translate.y = this._matrix.m13;
      this._translate.z = this._matrix.m23;
      this._is_translate_updated = true;
    }
    return this._translate.clone();
  }

  get translate() {
    return this.getTranslateAtOrStatic(this._activeAnimationLineName, this._getCurrentAnimationInputValue(this._activeAnimationLineName));
  }

  getTranslateAt(lineName: string, inputValue: number): Vector3 {
    let value = this._getAnimatedTransformValue(inputValue, this._animationLine[lineName], 'translate');
    if (value !== null) {
      this._translate = value;
      this._is_translate_updated = true;
    }
    return value;
  }

  getTranslateAtOrStatic(lineName: string, inputValue: number) {
    let value = this.getTranslateAt(lineName, inputValue);
    if (value === null) {
      return this.getTranslateNotAnimated();
    }
    return value;
  }

  set rotate(vec: Vector3) {

    this._rotate = vec.clone();
    this._is_euler_angles_updated = true;
    this._is_quaternion_updated = false;
    this._is_trs_matrix_updated = false;
    this._is_inverse_trs_matrix_updated = false;


    this.__updateTransform();
  }

  get rotate() {
    return this.getRotateAtOrStatic(this._activeAnimationLineName, this._getCurrentAnimationInputValue(this._activeAnimationLineName));
  }

  getRotateAt(lineName: string, inputValue: Vector3) {
    let value = this._getAnimatedTransformValue(inputValue, this._animationLine[lineName], 'rotate');
    if (value !== null) {
      this._rotate = value;
      this._is_euler_angles_updated = true;  
    }
    return value;
  }

  getRotateAtOrStatic(lineName: string, inputValue: Vector3) {
    let value = null;
    if (this._activeAnimationLineName) {
      value = this.getRotateAt(this._activeAnimationLineName, inputValue);
    }
    if (value === null) {
      return this.getRotateNotAnimated();
    }
    return value;
  }

  getRotateNotAnimated() {
    if (this._is_euler_angles_updated) {
      return this._rotate.clone();
    } else if (this._is_trs_matrix_updated) {
      this._rotate = this._matrix.toEulerAngles();
    } else if (this._is_quaternion_updated) {
      this._rotate = (new Matrix44(this._quaternion)).toEulerAngles();
    }

    this._is_euler_angles_updated = true;
    return this._rotate.clone();
  }

  set scale(vec: Vector3) {
    this._scale = vec.clone();
    this._is_scale_updated = true;
    this._is_trs_matrix_updated = false;
    this._is_inverse_trs_matrix_updated = false;
    this.__updateTransform();
  }

  get scale() {
    return this.getScaleAtOrStatic(this._activeAnimationLineName, this._getCurrentAnimationInputValue(this._activeAnimationLineName));
  }

  getScaleAt(lineName: string, inputValue: number) {
    let value = this._getAnimatedTransformValue(inputValue, this._animationLine[lineName], 'scale');
    if (value !== null) {
      this._scale = value.clone();
      this._is_scale_updated = true;  
    }
    return value;
  }

  getScaleAtOrStatic(lineName: string, inputValue: number) {
    let value = this.getScaleAt(lineName, inputValue);
    if (value === null) {
      return this.getScaleNotAnimated();
    }
    return value;
  }

  getScaleNotAnimated() {    
    if (this._is_scale_updated) {
      return this._scale.clone();
    } else if (this._is_trs_matrix_updated) {
      let m = this._matrix;
      this._scale.x = Math.sqrt(m.m00*m.m00 + m.m01*m.m01 + m.m02*m.m02);
      this._scale.y = Math.sqrt(m.m10*m.m10 + m.m11*m.m11 + m.m12*m.m12);
      this._scale.z = Math.sqrt(m.m20*m.m20 + m.m21*m.m21 + m.m22*m.m22);
      this._is_scale_updated = true;
    }
    
    return this._scale.clone();
  }

  set matrix(mat: Matrix44) {
    this._matrix = mat.clone();
    this._is_trs_matrix_updated = true;
    this._is_translate_updated = false;
    this._is_euler_angles_updated = false;
    this._is_quaternion_updated = false;
    this._is_scale_updated = false;
    this._is_inverse_trs_matrix_updated = false;

    this.__updateTransform();

  }



  get matrix() {
    let input = void 0;
    if (this._activeAnimationLineName !== null) {
      input = this._getCurrentAnimationInputValue(this._activeAnimationLineName);
    }

    let value = this.getMatrixAtOrStatic(this._activeAnimationLineName, input);

    return value;
  }

  getMatrixAt(lineName: string, inputValue: Vector3) {
    let value = this._getAnimatedTransformValue(inputValue, this._animationLine[lineName], 'matrix');
    if (value !== null) {
      this._translate = value;
      this._is_translate_updated = true;  
    }
    return value;
  }

  getMatrixNotAnimated() {

    if (this._is_trs_matrix_updated) {
      return this._matrix.clone();
    }

    const rotationMatrix = new Matrix44(this.getQuaternionNotAnimated());

    let scale = this.getScaleNotAnimated();

    this._matrix = Matrix44.multiply(rotationMatrix, Matrix44.scale(scale));
    let translateVec = this.getTranslateNotAnimated();
    this._matrix.m03 = translateVec.x;
    this._matrix.m13 = translateVec.y;
    this._matrix.m23 = translateVec.z;

    this._is_trs_matrix_updated = true;

    return this._matrix.clone();
  }

  get transformMatrix() {
    let input = void 0;
    if (this._activeAnimationLineName !== null) {
      input = this._getCurrentAnimationInputValue(this._activeAnimationLineName);
    }

    const matrix = this.getMatrixAtOrStatic(this._activeAnimationLineName, input);

    return matrix;
  }

  isTrsMatrixNeeded(lineName: string, inputValue: number) {
    //console.log(this._animationLine['time']);
    let result = (
      this._getAnimatedTransformValue(inputValue, this._animationLine[lineName], 'translate') === null &&
      this._getAnimatedTransformValue(inputValue, this._animationLine[lineName], 'rotate') === null &&
      this._getAnimatedTransformValue(inputValue, this._animationLine[lineName], 'quaternion') === null &&
      this._getAnimatedTransformValue(inputValue, this._animationLine[lineName], 'scale') === null
    );
    return result;
  }


  getMatrixAtOrStatic(lineName: string, inputValue: number) {
    let input = inputValue;

    //console.log(this.userFlavorName + ": " + this.isTrsMatrixNeeded(lineName, inputValue));
    if (this.isTrsMatrixNeeded(lineName, inputValue) && this._is_trs_matrix_updated) {
      return this.getMatrixNotAnimated();
    } else {

      let quaternion = this.getQuaternionAtOrStatic(lineName, input);
      const rotationMatrix = new Matrix44(quaternion);

      let scale = this.getScaleAtOrStatic(lineName, input);
      
      this._matrix = Matrix44.multiply(rotationMatrix, Matrix44.scale(scale));
      let translateVec = this.getTranslateAtOrStatic(lineName, input);
      this._matrix.m03 = translateVec.x;
      this._matrix.m13 = translateVec.y;
      this._matrix.m23 = translateVec.z;

      this._is_trs_matrix_updated = true;
 
      return this._matrix.clone();

    }

 }


  set quaternion(quat: Quaternion) {
    this._quaternion = quat.clone();
    this._is_quaternion_updated = true;
    this._is_euler_angles_updated = false;
    this._is_trs_matrix_updated = false;
    this._is_inverse_trs_matrix_updated = false;
    this.__updateTransform();
  }

  get quaternion() {
    return this.getQuaternionAtOrStatic(this._activeAnimationLineName, this._getCurrentAnimationInputValue(this._activeAnimationLineName));
  }

  getQuaternionAt(lineName: string, inputValue: number) {
    let value = this._getAnimatedTransformValue(inputValue, this._animationLine[lineName], 'quaternion');
    if (value !== null) {
      this._quaternion = value;
      this._is_quaternion_updated = true;  
    }
    return value;
  }

  getQuaternionAtOrStatic(lineName: string, inputValue: number) {
    let value = this.getQuaternionAt(lineName, inputValue);
    if (value === null) {
      return this.getQuaternionNotAnimated();
    }
    return value;
  }
  
  getQuaternionNotAnimated() {
    let value = null;
    if (this._is_quaternion_updated) {
      return this._quaternion.clone();
    } else if (!this._is_quaternion_updated) {
      if (this._is_trs_matrix_updated) {
        value = Quaternion.fromMatrix(this._matrix);
      } else if (this._is_euler_angles_updated) {
        value = Quaternion.fromMatrix(Matrix44.rotateXYZ(this._rotate.x, this._rotate.y, this._rotate.z));
      } else {
        console.log('Not Quaternion Updated in error!');
      }
      this._quaternion = value;
      this._is_quaternion_updated = true;
    }

    return this._quaternion.clone();
  }

  get inverseTransformMatrix() {
    if (!this._is_inverse_trs_matrix_updated) {
      this._invMatrix = this.transformMatrix.invert();
      this._is_inverse_trs_matrix_updated = true;
    }
    return this._invMatrix.clone();
  }

  get normalMatrix() {
    return new Matrix33(Matrix44.invert(this.transformMatrix).transpose());
  }

  __updateTransform() {
    this.__updateRotation();
    this.__updateTranslate();
    this.__updateScale();
    this.__updateMatrix();
    this._needUpdate();
  }

  __updateRotation() {
    if (this._is_euler_angles_updated && !this._is_quaternion_updated) {
      this._quaternion = Quaternion.fromMatrix(Matrix44.rotateXYZ(this._rotate.x, this._rotate.y, this._rotate.z));
      this._is_quaternion_updated = true;
    } else if (!this._is_euler_angles_updated && this._is_quaternion_updated) {
      this._rotate = (new Matrix44(this._quaternion)).toEulerAngles();
      this._is_euler_angles_updated = true;
    } else if (!this._is_euler_angles_updated && !this._is_quaternion_updated && this._is_trs_matrix_updated) {
      const m = this._matrix;
      this._quaternion = Quaternion.fromMatrix(m);
      this._is_quaternion_updated = true;
      this._rotate = m.toEulerAngles();
      this._is_euler_angles_updated = true;
    }
  }

  __updateTranslate() {
    if (!this._is_translate_updated && this._is_trs_matrix_updated) {
      const m = this._matrix;
      this._translate.x = m.m03;
      this._translate.y = m.m13;
      this._translate.z = m.m23;
      this._is_translate_updated = true;
    }
  }

  __updateScale() {
    if (!this._is_scale_updated && this._is_trs_matrix_updated) {
      const m = this._matrix;
      this._scale.x = Math.sqrt(m.m00*m.m00 + m.m01*m.m01 + m.m02*m.m02);
      this._scale.y = Math.sqrt(m.m10*m.m10 + m.m11*m.m11 + m.m12*m.m12);
      this._scale.z = Math.sqrt(m.m20*m.m20 + m.m21*m.m21 + m.m22*m.m22);
      this._is_scale_updated = true;
    }
  }

  __updateMatrix() {
    if (!this._is_trs_matrix_updated && this._is_translate_updated && this._is_quaternion_updated && this._is_scale_updated) {
      const rotationMatrix = new Matrix44(this.getQuaternionNotAnimated());
  
      let scale = this.getScaleNotAnimated();
  
      this._matrix = Matrix44.multiply(rotationMatrix, Matrix44.scale(scale));
      let translateVec = this.getTranslateNotAnimated();
      this._matrix.m03 = translateVec.x;
      this._matrix.m13 = translateVec.y;
      this._matrix.m23 = translateVec.z;
  
      this._is_trs_matrix_updated = true;
    }
  }


  _copy(instance: L_Element) {
    super._copy(instance);

    instance._translate = this._translate.clone();
    instance._scale = this._scale.clone();
    instance._rotate = this._rotate.clone();
    instance._quaternion = this._quaternion.clone();
    instance._matrix = this._matrix.clone();


    instance._animationLine = {};

    for (let lineName in this._animationLine) {
      instance._animationLine[lineName] = {};
      for (let attributeName in this._animationLine[lineName]) {
        instance._animationLine[lineName][attributeName] = {};
        instance._animationLine[lineName][attributeName].input = this._animationLine[lineName][attributeName].input.concat();

        let instanceOutput = [];
        let thisOutput = this._animationLine[lineName][attributeName].output;
        for (let i=0; i<thisOutput.length; i++) {
          instanceOutput.push((typeof thisOutput[i] === 'number') ? thisOutput[i] : thisOutput[i].clone());
        }
        instance._animationLine[lineName][attributeName].output = instanceOutput;

        instance._animationLine[lineName][attributeName].outputAttribute = this._animationLine[lineName][attributeName].outputAttribute;

        instance._animationLine[lineName][attributeName].outputComponentN = this._animationLine[lineName][attributeName].outputComponentN;
      }
    }

    instance._is_trs_matrix_updated = this._is_trs_matrix_updated;
    instance._is_translate_updated = this._is_translate_updated;
    instance._is_scale_updated = this._is_scale_updated;
    instance._is_quaternion_updated = this._is_quaternion_updated;
    instance._is_euler_angles_updated = this._is_euler_angles_updated;
    instance._is_inverse_trs_matrix_updated = this._is_inverse_trs_matrix_updated;

    instance._updateCountAsElement = this._updateCountAsElement;
  }

  setPropertiesFromJson(arg) {
    let json = arg;
    if (typeof arg === "string") {
      json = JSON.parse(arg);
    }
    for(let key in json) {
      if(json.hasOwnProperty(key) && key in this) {
        if (key === "quaternion") {
          this[key] = MathClassUtil.arrayToQuaternion(json[key]);
        } else {
          this[key] = MathClassUtil.arrayToVectorOrMatrix(json[key]);
        }
      }
    }
  }

  setRotationFromNewUpAndFront(UpVec, FrontVec) {
    let yDir = UpVec;
    let xDir = Vector3.cross(yDir, FrontVec);
    let zDir = Vector3.cross(xDir, yDir);
    
    let rotateMatrix = Matrix44.identity();

    rotateMatrix.m00 = xDir.x;
    rotateMatrix.m10 = xDir.y;
    rotateMatrix.m20 = xDir.z;
  
    rotateMatrix.m01 = yDir.x;
    rotateMatrix.m11 = yDir.y;
    rotateMatrix.m21 = yDir.z;
  
    rotateMatrix.m02 = zDir.x;
    rotateMatrix.m12 = zDir.y;
    rotateMatrix.m22 = zDir.z;
  
    this.rotateMatrix33 = rotateMatrix;
  }

  headToDirection(fromVec, toVec) {
    const fromDir = Vector3.normalize(fromVec);
    const toDir = Vector3.normalize(toVec);
    const rotationDir = Vector3.cross(fromDir, toDir);
    const cosTheta = Vector3.dotProduct(fromDir, toDir);
    let theta = Math.acos(cosTheta);
    if (GLBoost["VALUE_ANGLE_UNIT"] === GLBoost.DEGREE) {
      theta = MathUtil.radianToDegree(theta);
    }
    this.quaternion = Quaternion.axisAngle(rotationDir, theta);
  }

  set rotateMatrix33(rotateMatrix) {
    this.quaternion = Quaternion.fromMatrix(rotateMatrix);
  }

  get rotateMatrix33() {
    return new Matrix33(this.quaternion);
  }
}
