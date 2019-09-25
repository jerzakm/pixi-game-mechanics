import { Filter } from 'pixi.js'

export class JuiceAlphaShader extends Filter {
  constructor() {
    super(defaultVertexShader, buildFragmentShader());
  }
}

const buildFragmentShader = () => {

  return `
  precision mediump float;

  varying vec2 vTextureCoord;

  uniform sampler2D uSampler;

  uniform vec4 filterArea;


  void main(void)
  {
    vec4 color = texture2D(uSampler, vTextureCoord);

    float alpha = 1.0;

    float avg = (color.r+color.g+color.b)*0.3;

    if(avg > 0.1) {
      alpha = 0.0;
    }

    gl_FragColor = vec4(color.r*alpha, color.r*alpha, color.r*alpha, alpha);
  }
  `
}

const defaultVertexShader = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}
`