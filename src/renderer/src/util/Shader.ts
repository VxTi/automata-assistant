/**
 * @fileoverview Shader.ts
 * @author Luca Warmenhoven
 * @date Created on Friday June 21 - 20:54
 */

const defaultVertexShader = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

export class Shader {

    public gl: WebGLRenderingContext;
    public program: WebGLProgram;
    private readonly vertexShader: WebGLShader | null;
    private readonly fragmentShader: WebGLShader | null;

    /**
     * Shader class.
     * This class will handle the creation of shaders.
     * @param gl The WebGLRenderingContext.
     * @param fragmentSource The source code of the fragment shader.
     * @param vertexSource The source code of the vertex shader. If not provided, a default 2D shader will be used.
     * @constructor
     */
    constructor(gl: WebGLRenderingContext, fragmentSource: string, vertexSource?: string,) {
        this.gl = gl;
        this.vertexShader = this.generateShader(gl.VERTEX_SHADER, vertexSource || defaultVertexShader);
        this.fragmentShader = this.generateShader(gl.FRAGMENT_SHADER, fragmentSource);
        this.program = this.generateProgram() as WebGLProgram;
    }

    /**
     * Supply the shader with a uniform value.
     */
    public uniform1f(name: string, value: number): void {
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, name), value);
    }

    /**
     * Use the shader.
     */
    public use(): void {
        this.gl.useProgram(this.program);
    }

    /**
     * Generate a shader of a certain type.
     * @param type The type of shader to generate.
     * @param source The source code of the shader.
     * @returns The generated shader.
     */
    private generateShader(type: number, source: string): WebGLShader | null {
        const shader = this.gl.createShader(type) as WebGLShader;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if ( !this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS) ) {
            console.error(`Error compiling shader: ${this.gl.getShaderInfoLog(shader)}`);
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    /**
     * Generate the program.
     * @returns The generated program.
     */
    private generateProgram(): WebGLProgram | null {
        // oh no, what if something went wrong...
        if ( this.vertexShader == null || this.fragmentShader == null )
            return null;
        this.program = this.gl.createProgram() as WebGLProgram;
        this.gl.attachShader(this.program, this.vertexShader);
        this.gl.attachShader(this.program, this.fragmentShader);
        this.gl.linkProgram(this.program);

        if ( !this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS) ) {
            console.error(`Error linking program: ${this.gl.getProgramInfoLog(this.program)}`);
            this.gl.deleteProgram(this.program);
            return null;
        }
        return this.program;
    }
}