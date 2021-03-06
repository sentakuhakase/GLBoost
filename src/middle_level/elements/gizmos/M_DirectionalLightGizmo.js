import M_Gizmo from './M_Gizmo';
import Arrow from '../../../low_level/primitives/Arrow';
import ClassicMaterial from '../../../low_level/materials/ClassicMaterial';
import M_Mesh from '../meshes/M_Mesh';
import Vector4 from '../../../low_level/math/Vector4';

export default class M_DirectionalLightGizmo extends M_Gizmo {
  constructor(glBoostSystem, length) {
    super(glBoostSystem, null, null);
    this._init(glBoostSystem, length);

    this.isVisible = false;

    this.baseColor = new Vector4(0.8, 0.8, 0, 1);
  }

  _init(glBoostSystem, length) {
    this._material = new ClassicMaterial(glBoostSystem);
    this._mesh = new M_Mesh(glBoostSystem,
      new Arrow(glBoostSystem, length, 3),
      this._material);

    this.addChild(this._mesh);
  }

  set rotate(rotateVec3) {
    this._mesh.rotate = rotateVec3;
  }

  get rotate() {
    return this._mesh.rotate;
  }

  set baseColor(colorVec) {
    this._material.baseColor = colorVec;
  }

  get baseColor() {
    return this._material.baseColor;
  }
}
