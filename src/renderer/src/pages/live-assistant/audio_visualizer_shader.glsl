#version 300 es
precision mediump float;

uniform vec2 iResolution;
uniform float time;

#define AUDIO_RADIUS_DIFFERENCE 0.5
#define AUDIO_BUBBLES 12
#define DELTA_THETA (2.0 * 3.14159265359 / float(AUDIO_BUBBLES))

uniform float audioLevels[AUDIO_BUBBLES];
const vec4 bubbleColor = vec4(1.0, 1.0, 1.0, 1.0);

out vec4 fragColor;// Define the output variable for fragment color

float getAudioLevel(vec2 position)
{
    float angle = atan(position.y, position.x);
    float rawIndex = (angle + 3.14159265359) / DELTA_THETA;
    int currentAudioIndex = int(mod(round(rawIndex), float(AUDIO_BUBBLES)));
    int previousAudioIndex = (currentAudioIndex - 1 + AUDIO_BUBBLES) % AUDIO_BUBBLES;
    return smoothstep(0.0, 1.0, abs(float(currentAudioIndex) - rawIndex)) * audioLevels[currentAudioIndex] * 40.0;}

void main()
{
    // Calculate the distance from the current fragment to the center
    float distanceFromCenter = length(gl_FragCoord.xy - iResolution);

    // Map the angle to an index of the audioLevels array
    float audioLevel = getAudioLevel(gl_FragCoord.xy);

    // Calculate the dynamic radius based on the audio level
    float dynamicRadius = iResolution.x / 2.0 + audioLevel * AUDIO_RADIUS_DIFFERENCE;

    // Determine if the current fragment is within the dynamic radius
    if (distanceFromCenter < dynamicRadius) {
        fragColor = bubbleColor;
    } else {
        fragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}
