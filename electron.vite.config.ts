import { resolve }                             from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react                                   from '@vitejs/plugin-react'
import glsl                                    from 'vite-plugin-glsl'

export default defineConfig(
    {
        main: {
            plugins: [ externalizeDepsPlugin() ],
            build: {
                lib: {
                    entry: resolve(__dirname, 'src/backend/main/'),
                    formats: [ 'cjs' ]
                },
            },
            resolve: {
                alias: {
                    '@main': resolve(__dirname, 'src/backend/main/')
                }
            }
        },
        preload: {
            plugins: [ externalizeDepsPlugin() ],
            build: {
                lib: {
                    entry: resolve(__dirname, 'src/backend/preload/'),
                    formats: [ 'cjs' ]
                },
            },
            resolve: {
                alias: {
                    '@preload': resolve(__dirname, 'src/backend/preload/')
                }
            }
        },
        renderer: {
            resolve: {
                alias: {
                    '@renderer': resolve('src/renderer/src')
                }
            },
            plugins: [ react(), glsl() ]
        }
    }
)
