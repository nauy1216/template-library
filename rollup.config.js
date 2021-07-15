/* eslint-disable */
import path from 'path'
import ts from 'rollup-plugin-typescript2'
import replace from '@rollup/plugin-replace'
import json from '@rollup/plugin-json'
const args = require('minimist')(process.argv.slice(2))

const packageOptions =  {}
const name = 'index'
const isProduct = true

const outputConfigs = {
  esm: {
    file: `lib/${name}.esm.js`,
    format: `es`
  },
  cjs: {
    file: `lib/${name}.cjs.js`,
    format: `cjs`
  },
  global: {
    file:  `lib/${name}.global.js`,
    format: `iife`
  }
}
const packageFormats = Object.keys(outputConfigs)

const packageConfigs =  packageFormats.map(format => createConfig(format, outputConfigs[format]))

// 生产环境
if (isProduct) {
  packageFormats.forEach(format => {
    if (format === 'cjs') {
      packageConfigs.push(createProductionConfig(format))
    }
    if (/global/.test(format)) {
      packageConfigs.push(createMinifiedConfig(format))
    }
  })
}

export default packageConfigs

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`))
    process.exit(1)
  }

  output.sourcemap = true
  output.externalLiveBindings = false

  const isGlobalBuild = /global/.test(format)
  if (isGlobalBuild) {
    output.name = packageOptions.name
  }

  const tsPlugin = ts({
    check: true,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: false,
        declaration: true,
        declarationMap: false
      },
      exclude: ['tests']
    }
  })

  output.globals = { }

  const nodePlugins =
    format !== 'cjs'
      ? [
          require('@rollup/plugin-node-resolve').nodeResolve({
            preferBuiltins: true
          }),
          require('@rollup/plugin-commonjs')({
            sourceMap: false
          }),
          require('rollup-plugin-node-builtins')(),
          require('rollup-plugin-node-globals')()
        ]
      : []

  return {
    input: `src/index.ts`,
    external: [],
    plugins: [
      json({
        namedExports: false
      }),
      tsPlugin,
      createReplacePlugin(),
      ...nodePlugins,
      ...plugins
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    },
    treeshake: {
      moduleSideEffects: false
    }
  }
}

function createReplacePlugin() {
  const replacements = {
 
  }
  // allow inline overrides like
  //__RUNTIME_COMPILE__=true yarn build runtime-core
  Object.keys(replacements).forEach(key => {
    if (key in process.env) {
      replacements[key] = process.env[key]
    }
  })
  return replace(replacements)
}

function createProductionConfig(format) {
  return createConfig(format, {
    file: `lib/index.${format}.prod.js`,
    format: outputConfigs[format].format
  })
}

function createMinifiedConfig(format) {
  const { terser } = require('rollup-plugin-terser')
  return createConfig(
    format,
    {
      file: outputConfigs[format].file.replace(/\.js$/, '.prod.js'),
      format: outputConfigs[format].format
    },
    [
      terser({
        module: /^esm/.test(format),
        compress: {
          ecma: 2015,
          pure_getters: true
        }
      })
    ]
  )
}
