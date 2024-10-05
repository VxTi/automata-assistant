precision mediump float;

uniform float time;// Uniform to pass time from JavaScript
uniform vec2 iResolution;// Resolution of the screen
#define S(a, b, t) smoothstep(a, b, t)

const vec3 primary_0 = vec3(0.0, 0.0, 0.1);
const vec3 primary_1 = vec3(0.192, 0.284, 0.533);
const vec3 primary_2 = vec3(0.610, 0.010, 0.05);
const vec3 primary_3 = vec3(0.350, 0.71, 0.953);

mat2 Rot(float a)
{
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

vec2 hash(vec2 p)
{
    return fract(sin(vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37))))*43758.5453);
}

float noise(in vec2 p)
{
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f*f*(3.0-2.0*f);

    float n = mix(mix(dot(-1.0+2.0*hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
    dot(-1.0+2.0*hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(-1.0+2.0*hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
    dot(-1.0+2.0*hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
    return 0.5 + 0.5*n;
}


void main()
{
    vec2 uv = gl_FragCoord.xy/iResolution.xy;
    float ratio = iResolution.x / iResolution.y;

    vec2 tuv = uv;
    tuv -= .5;

    // rotate with Noise
    float degree = noise(vec2(time*.1, tuv.x*tuv.y));

    tuv.y *= 1./ratio;
    tuv *= Rot(radians((degree-.5)*720.+180.));
    tuv.y *= ratio;

    // Wave warp with sin
    float frequency = 1.;
    float amplitude = 40.;
    float speed = time;
    tuv.x += sin(tuv.y*frequency+speed)/amplitude;
    tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);

    // draw the image
    vec3 layer1 = mix(primary_0, primary_1, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
    vec3 layer2 = mix(primary_2, primary_3, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
    vec3 finalComp = mix(layer1, layer2, S(.5, -.3, tuv.y));

    gl_FragColor = vec4(finalComp, 1.0);
}