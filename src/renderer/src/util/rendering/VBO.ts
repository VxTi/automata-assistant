/**
 * @fileoverview VBO.ts
 * @author Luca Warmenhoven
 * @date Created on Saturday June 22 - 14:23
 */
import { Shader } from "./Shader";

// Default square vertices
// This can be used to draw the background of the canvas.
const defaultVertices: number[][] = [
    [ -1.0, -1.0 ], [ 1.0, -1.0 ], [ -1.0, 1.0 ],
    [ -1.0,  1.0 ], [ 1.0, -1.0 ], [  1.0, 1.0 ]
];

/**
 * Vertex Buffer Object
 */
export class VBO {

    // Private fields of the VBO
    private readonly vertices: number[][];
    private readonly buffer: WebGLBuffer;
    public readonly shader: Shader;
    public readonly gl: WebGLRenderingContext;

    /**
     * Create a new VBO.
     * A VBO is a Vertex Buffer Object, which can be used to render vertices.
     * @param gl The WebGLRenderingContext.
     * @param shader The shader to use.
     * @param vertices The vertices to use.
     * @param vertexSize The size of the vertex.
     * @constructor
     */
    constructor(gl: WebGLRenderingContext, shader: Shader, vertices?: number[][], vertexSize?: number) {
        this.gl = gl;
        this.shader = shader;
        this.buffer = gl.createBuffer() as WebGLBuffer;
        this.vertices = vertices || defaultVertices;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.vertices.flat()),
            gl.STATIC_DRAW
        );
        shader.use();
        const positionAttrib = gl.getAttribLocation(shader.program, 'position');
        gl.enableVertexAttribArray(positionAttrib);
        gl.vertexAttribPointer(positionAttrib, vertexSize || 2, gl.FLOAT, false, 0, 0);

    }

    /**
     * Render the VBO.
     * This will render the VBO using the shader.
     */
    public render(width: number, height: number) {
        this.shader.use();
        this.gl.uniform2f(this.gl.getUniformLocation(this.shader.program, 'iResolution'), width, height);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
}