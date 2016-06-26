import GLBoostMonitor from './GLBoostMonitor';

export default class GLBoostObject {
  constructor() {
    if (this.constructor === GLBoostObject) {
      throw new TypeError('Cannot construct GLBoostObject instances directly.');
    }
    this._setName();
    this._glBoostMonitor = GLBoostMonitor.getInstance();
    this._glBoostMonitor.registerGLBoostObject(this);
    this._userFlavorName = '';
  }

  _setName() {
    this.constructor._instanceCount = (typeof this.constructor._instanceCount === 'undefined') ? 0 : (this.constructor._instanceCount + 1);
    this._instanceName = this.constructor.name + '_' + this.constructor._instanceCount;
  }

  /**
   * [en] Return instance name.
   * [ja] インスタンス名を返します。
   * @returns {string} [en] the instance name. [ja] インスタンス名
   */
  toString() {
    return this._instanceName;
  }

  set userFlavorName(name) {
    this._userFlavorName = name;
  }

  get userFlavorName() {
    return this._userFlavorName;
  }

  get instanceNameWithUserFlavor() {
    this._instanceName + '_' + this._userFlavorName;
  }

}