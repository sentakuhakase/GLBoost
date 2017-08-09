import Shader from '../../low_level/shaders/Shader';
import VertexWorldShaderSource from './VertexWorldShader';

export class FragmentSimpleShaderSource {
  // In the context within these member methods,
  // this is the instance of the corresponding shader class.

  FSDefine_FragmentSimpleShaderSource(in_, f) {
    var shaderText =      'uniform float opacity;\n';
    return shaderText;
  }

  FSShade_FragmentSimpleShaderSource(f, gl) {
    var shaderText =   `rt0 = vec4(1.0, 1.0, 1.0, opacity);\n`;
    return shaderText;
  }

  prepare_FragmentSimpleShaderSource(gl, shaderProgram, expression, vertexAttribs, existCamera_f, lights, material, extraData) {

    var vertexAttribsAsResult = [];

    material.setUniform(shaderProgram, 'uniform_opacity', this._glContext.getUniformLocation(shaderProgram, 'opacity'));

    return vertexAttribsAsResult;
  }
}

export default class SimpleShader extends Shader {
  constructor(glBoostContext, basicShader = VertexWorldShaderSource) {

    super(glBoostContext);

    SimpleShader.mixin(basicShader);
    SimpleShader.mixin(FragmentSimpleShaderSource);
  }
}


GLBoost['SimpleShader'] = SimpleShader;
