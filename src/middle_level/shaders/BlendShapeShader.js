import Shader from '../../low_level/shaders/Shader';

export default class BlendShapeShaderSource {

  VSDefine_BlendShapeShaderSource(in_, out_, f) {
    var shaderText = '';
    f.forEach((attribName)=>{
      if (this.BlendShapeShaderSource_isShapeTarget(attribName)) {
        shaderText+=`${in_} vec3 aVertex_${attribName};\n`;
        shaderText+='uniform float blendWeight_' + attribName  + ';\n';
      }
    });
    return shaderText;
  }

  VSTransform_BlendShapeShaderSource(existCamera_f, f, lights, material, extraData) {
    var shaderText = '';
    var numOfShapeTargets = this.BlendShapeShaderSource_numberOfShapeTargets(f);
    shaderText += '    vec3 blendedPosition = aVertex_position;\n';    
    f.forEach((attribName)=>{
      if (this.BlendShapeShaderSource_isShapeTarget(attribName)) {
        shaderText += 'blendedPosition += (aVertex_' + attribName + ' - aVertex_position) * blendWeight_' + attribName + ';\n';
      }
    });
    if (existCamera_f) {
      shaderText += '  gl_Position = pvwMatrix * vec4(blendedPosition, 1.0);\n';
    } else {
      shaderText += '  gl_Position = vec4(blendedPosition, 1.0);\n';
    }
    return shaderText;
  }

  prepare_BlendShapeShaderSource(gl, shaderProgram, expression, vertexAttribs, existCamera_f, lights, material, extraData) {
    var vertexAttribsAsResult = [];
    vertexAttribs.forEach((attribName)=>{
      if (this.BlendShapeShaderSource_isShapeTarget(attribName)) { // if POSITION and ShapeTargets...
        vertexAttribsAsResult.push(attribName);
        shaderProgram['vertexAttribute_' + attribName] = gl.getAttribLocation(shaderProgram, 'aVertex_' + attribName);
        gl.enableVertexAttribArray(shaderProgram['vertexAttribute_' + attribName]);
      }
    });

    vertexAttribs.forEach((attribName)=>{
      if (this.BlendShapeShaderSource_isShapeTarget(attribName)) {
        // Specifically, this uniform location is saved directly to the material.
        material['uniform_FloatSampler_blendWeight_' + attribName] = this._glContext.getUniformLocation(shaderProgram, 'blendWeight_' + attribName);
        // Initially zero initialization
        this._glContext.uniform1f(material['uniform_FloatSampler_blendWeight_' + attribName], 0.0, true);
      }
    });

    return vertexAttribsAsResult;
  }

  BlendShapeShaderSource_isShapeTarget(attribName) {
    return !Shader._exist(attribName, GLBoost.POSITION) && !Shader._exist(attribName, GLBoost.COLOR) && !Shader._exist(attribName, GLBoost.TEXCOORD);
  }

  BlendShapeShaderSource_numberOfShapeTargets(attributes) {
    var count = 0;
    attributes.forEach((attribName)=>{
      if (this.BlendShapeShaderSource_isShapeTarget(attribName)) {
        count += 1;
      }
    });
    return count;
  }
}
