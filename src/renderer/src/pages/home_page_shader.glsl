precision mediump float;

uniform float time;        // Uniform to pass time from JavaScript
uniform vec2 iResolution;  // Resolution of the screen

// CPPN function for smoother gradients
vec3 cppn(vec2 pos, float time) {
    // Normalize the position to [-1, 1] and add some time-based distortion
    float x = (pos.x * 2.0 - 1.0) * .2;
    float y = (pos.y * 2.0 - 1.0) * .2 + sin(time * 0.1) * 0.1;
    x *= iResolution.x / iResolution.y;  // Correct aspect ratio

    // Smooth gradient using positional coordinates instead of radial focus
    float red   = 0.3 + 0.5 * sin(x * 5.0 + time * 0.1);    // Smooth gradient across x-axis
    float green = 0.3 + 0.2 * cos(y * 4.0 + time * 0.2);    // Smooth gradient across y-axis
    float blue  = 0.2 + 0.5 * sin((x + y) * 5.0 + time * 0.3); // Combined x-y gradient

    // Return the combined color
    return vec3(red, green, blue);
}

void main() {
    // Normalize pixel coordinates and maintain aspect ratio
    vec2 uv = gl_FragCoord.xy / iResolution;

    // Calculate the gradient color using the CPPN function
    vec3 color = cppn(uv, time);

    // Output the final color
    gl_FragColor = vec4(color, 1.0);
}