precision mediump float;

uniform float time;
uniform vec2 iResolution;

const vec3 darkBlue = vec3(0.0, 0.0, 0.1);
const vec3 lightBlue = vec3(0.192, 0.384, 0.633);
const vec3 redAccent = vec3(0.610, 0.010, 0.05);
const vec3 skyBlue = vec3(0.350, 0.61, 0.653);

/**
 * Creates a 2x2 rotation matrix.
 */
mat2 createRotationMatrix(float angle)
{
    float sinAngle = sin(angle);
    float cosAngle = cos(angle);
    return mat2(cosAngle, -sinAngle, sinAngle, cosAngle);
}

/**
 * Generates a hash value for a given position.
 *
 * @param position The position to generate the hash value for.
 * @return The hash value.
 */
vec2 generateHashValue(vec2 position)
{
    return fract(sin(vec2(dot(position, vec2(2127.1, 81.17)), dot(position, vec2(1269.5, 283.37)))) * 43758.5453);
}

/**
 * Generates a smooth noise value for a given position.
 *
 * @param position The position to generate the noise value for.
 * @return The noise value.
 */
float generateSmoothNoise(in vec2 position)
{
    vec2 integerPart = floor(position);
    vec2 fractionalPart = fract(position);

    vec2 smoothFactor = fractionalPart * fractionalPart * (3.0 - 2.0 * fractionalPart);

    float noiseValue = mix(
        mix(
            dot(
                -1.0 + 2.0 * generateHashValue(integerPart + vec2(0.0, 0.0)),
                fractionalPart - vec2(0.0, 0.0)),
            dot(
                -1.0 + 2.0 * generateHashValue(integerPart + vec2(1.0, 0.0)),
                fractionalPart - vec2(1.0, 0.0)
            ),
            smoothFactor.x
        ),
        mix(
            dot(
                -1.0 + 2.0 * generateHashValue(integerPart + vec2(0.0, 1.0)),
                fractionalPart - vec2(0.0, 1.0)
            ),
            dot(
                -1.0 + 2.0 * generateHashValue(integerPart + vec2(1.0, 1.0)),
                fractionalPart - vec2(1.0, 1.0)
            ),
            smoothFactor.x
        ),
        smoothFactor.y
    );

    return 0.5 + 0.5 * noiseValue;
}

void main()
{
    vec2 fragCoordNormalized = gl_FragCoord.xy / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;

    vec2 fragCoordCentered = fragCoordNormalized - 0.5;

    float noiseValue = generateSmoothNoise(vec2(time * 0.1, fragCoordCentered.x * fragCoordCentered.y));
    fragCoordCentered.y *= 1.0 / aspectRatio;
    fragCoordCentered *= createRotationMatrix(radians((noiseValue - 0.5) * 360.0 + 180.0));
    fragCoordCentered.y *= aspectRatio;

    float waveFrequency = .5;
    float waveAmplitude = 40.0;
    float waveSpeed = time;
    fragCoordCentered.x += sin(fragCoordCentered.y * waveFrequency + waveSpeed) / waveAmplitude;
    fragCoordCentered.y += sin(fragCoordCentered.x * waveFrequency * 1.5 + waveSpeed) / (waveAmplitude * 0.5);

    vec3 gradientLayer1 = mix(
        darkBlue, lightBlue, smoothstep(-0.7, 0.7, (fragCoordCentered * createRotationMatrix(radians(-5.0))).x)
    );
    vec3 gradientLayer2 = mix(
        redAccent, skyBlue, smoothstep(-0.7, 0.7, (fragCoordCentered * createRotationMatrix(radians(-5.0))).x)
    );

    vec3 finalColor = mix(gradientLayer1, gradientLayer2, smoothstep(0.7, -0.5, fragCoordCentered.y));

    gl_FragColor = vec4(finalColor, 1.0);
}
