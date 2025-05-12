'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { useDebounce } from 'use-debounce'
import { withErrorBoundary } from 'react-error-boundary'

interface Props {
  defaultGridSize?: number
}

function WebGPUGameOfLife({ defaultGridSize = 64 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pauseRef = useRef(false)
  const [isPaused, setIsPaused] = useState(false)
  const [resetCount, setResetCount] = useState(0)
  const [error, setError] = useState('')
  const [gridSize, setGridSize] = useState(defaultGridSize)
  const [gridSizeDebounced] = useDebounce(gridSize, 200)

  useEffect(() => {
    const entry: GPU | null = typeof window !== 'undefined' ? navigator.gpu : null

    if (!entry) {
      throw new Error('WebGPU is not supported on this browser.')
    }

    let renderIntervalRef: Parameters<typeof clearInterval>[0]
    let deviceRef: GPUDevice

    const initGOL = async () => {
      const adapter = await entry.requestAdapter()

      if (!adapter) {
        setError('No adapter available')

        return Promise.reject()
      }

      const device = (deviceRef = await adapter?.requestDevice())
      const canvas = canvasRef.current as HTMLCanvasElement

      const devicePixelRatio = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * devicePixelRatio
      canvas.height = canvas.clientHeight * devicePixelRatio

      // Canvas configuration
      const context = canvas.getContext('webgpu')
      const canvasFormat = navigator.gpu.getPreferredCanvasFormat()

      if (!context) {
        setError('WebGPU context is not available')

        return Promise.reject()
      }

      context.configure({
        device: device,
        format: canvasFormat,
      })

      const vertices = new Float32Array([
        // Triangle 1
        -0.8, -0.8, 0.8, -0.8, 0.8, 0.8,

        // Triangle 2
        -0.8, -0.8, 0.8, 0.8, -0.8, 0.8,
      ])

      const vertexBuffer = device.createBuffer({
        label: 'Cell vertices',
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      })

      device.queue.writeBuffer(vertexBuffer, 0, vertices)

      const vertexBufferLayout: GPUVertexBufferLayout = {
        arrayStride: 8,
        attributes: [
          {
            format: 'float32x2',
            offset: 0,
            shaderLocation: 0, // Position. Matches @location(0) in the @vertex shader.
          },
        ],
      }

      // Create the shader that will render the cells.
      const cellShaderModule = device.createShaderModule({
        label: 'Cell shader',
        code: `
            struct VertexInput {
              @location(0) pos: vec2f,
              @builtin(instance_index) instance: u32,
            };

            struct VertexOutput {
              @builtin(position) pos: vec4f,
              @location(0) cell: vec2f,
            };

            @group(0) @binding(0) var<uniform> grid: vec2f;
            @group(0) @binding(1) var<storage> cellState: array<u32>;

            @vertex
            fn vertexMain(input: VertexInput) -> VertexOutput  {
              let i = f32(input.instance);
              let cell = vec2f(i % grid.x, floor(i / grid.x));
              let state = f32(cellState[input.instance]);

              let cellOffset = cell / grid * 2;
              let gridPos = (input.pos * state + 1) / grid - 1 + cellOffset;

              var output: VertexOutput;
              output.pos = vec4f(gridPos, 0, 1);
              output.cell = cell; // New line!
              return output;
            }

            struct FragInput {
              @location(0) cell: vec2f,
            };

            @fragment
            fn fragmentMain(input: FragInput) -> @location(0) vec4f {
              // Remember, fragment return values are (Red, Green, Blue, Alpha)
              // and since cell is a 2D vector, this is equivalent to:
              // (Red = cell.x, Green = cell.y, Blue = 0, Alpha = 1)
              let c = input.cell / grid;
              return vec4f(c, 1-c.y, 1);
            }
          `,
      })

      const WORKGROUP_SIZE = 8

      // Create the compute shader that will process the simulation.
      const simulationShaderModule = device.createShaderModule({
        label: 'Game of Life simulation shader',
        code: `
          @group(0) @binding(0) var<uniform> grid: vec2f;

          @group(0) @binding(1) var<storage> cellStateIn: array<u32>;
          @group(0) @binding(2) var<storage, read_write> cellStateOut: array<u32>;

          fn cellIndex(cell: vec2u) -> u32 {
            return (cell.y % u32(grid.y)) * u32(grid.x) + (cell.x % u32(grid.x));
          }

          fn cellActive(x: u32, y: u32) -> u32 {
            return cellStateIn[cellIndex(vec2(x, y))];
          }

          @compute
          @workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE})
          fn computeMain(@builtin(global_invocation_id) cell: vec3u) {
            // Determine how many active neighbors this cell has.
            let activeNeighbors = cellActive(cell.x+1, cell.y+1) +
                                  cellActive(cell.x+1, cell.y) +
                                  cellActive(cell.x+1, cell.y-1) +
                                  cellActive(cell.x, cell.y-1) +
                                  cellActive(cell.x-1, cell.y-1) +
                                  cellActive(cell.x-1, cell.y) +
                                  cellActive(cell.x-1, cell.y+1) +
                                  cellActive(cell.x, cell.y+1);

            let i = cellIndex(cell.xy);

            // Conway's game of life rules:
            switch activeNeighbors {
              case 2: {
                cellStateOut[i] = cellStateIn[i];
              }
              case 3: {
                cellStateOut[i] = 1;
              }
              default: {
                cellStateOut[i] = 0;
              }
            }
          }`,
      })

      const GRID_SIZE = gridSizeDebounced
      const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE])
      const uniformBuffer = device.createBuffer({
        label: 'Grid Uniforms',
        size: uniformArray.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      device.queue.writeBuffer(uniformBuffer, 0, uniformArray)

      // Create an array representing the active state of each cell.
      const cellStateArray = new Uint32Array(GRID_SIZE * GRID_SIZE)

      // Create two storage buffers to hold the cell state.
      const cellStateStorage = [
        device.createBuffer({
          label: 'Cell State A',
          size: cellStateArray.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }),
        device.createBuffer({
          label: 'Cell State B',
          size: cellStateArray.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }),
      ]

      // Set each cell to a random state, then copy the JavaScript array
      // into the storage buffer.
      for (let i = 0; i < cellStateArray.length; ++i) {
        cellStateArray[i] = Math.random() > 0.6 ? 1 : 0
      }
      device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray)

      // Mark every other cell of the second grid as active.
      for (let i = 0; i < cellStateArray.length; i++) {
        cellStateArray[i] = i % 2
      }
      device.queue.writeBuffer(cellStateStorage[1], 0, cellStateArray)

      const bindGroupLayout = device.createBindGroupLayout({
        label: 'Cell Bind Group Layout',
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
            buffer: {}, // Grid uniform buffer
          },
          {
            binding: 1,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
            buffer: { type: 'read-only-storage' }, // Cell state input buffer
          },
          {
            binding: 2,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: 'storage' }, // Cell state output buffer
          },
        ],
      })

      const bindGroups = [
        device.createBindGroup({
          label: 'Cell renderer bind group A',
          layout: bindGroupLayout,
          entries: [
            {
              binding: 0,
              resource: { buffer: uniformBuffer },
            },
            {
              binding: 1,
              resource: { buffer: cellStateStorage[0] },
            },
            {
              binding: 2,
              resource: { buffer: cellStateStorage[1] },
            },
          ],
        }),
        device.createBindGroup({
          label: 'Cell renderer bind group B',
          layout: bindGroupLayout,
          entries: [
            {
              binding: 0,
              resource: { buffer: uniformBuffer },
            },
            {
              binding: 1,
              resource: { buffer: cellStateStorage[1] },
            },
            {
              binding: 2,
              resource: { buffer: cellStateStorage[0] },
            },
          ],
        }),
      ]

      const pipelineLayout = device.createPipelineLayout({
        label: 'Cell Pipeline Layout',
        bindGroupLayouts: [bindGroupLayout],
      })

      // Create a pipeline that renders the cell.
      const cellPipeline = device.createRenderPipeline({
        label: 'Cell pipeline',
        layout: pipelineLayout,
        vertex: {
          module: cellShaderModule,
          entryPoint: 'vertexMain',
          buffers: [vertexBufferLayout],
        },
        fragment: {
          module: cellShaderModule,
          entryPoint: 'fragmentMain',
          targets: [
            {
              format: canvasFormat,
            },
          ],
        },
      })

      const simulationPipeline = device.createComputePipeline({
        label: 'Simulation pipeline',
        layout: pipelineLayout,
        compute: {
          module: simulationShaderModule,
          entryPoint: 'computeMain',
        },
      })

      const UPDATE_INTERVAL = 200 // Update every 200ms (5 times/sec)
      let step = 0 // Track how many simulation steps have been run

      function render() {
        canvas.width = canvas.clientWidth * devicePixelRatio
        canvas.height = canvas.clientHeight * devicePixelRatio

        // Start a render pass
        const encoder = device.createCommandEncoder()

        const computePass = encoder.beginComputePass()

        computePass.setPipeline(simulationPipeline)
        computePass.setBindGroup(0, bindGroups[step % 2])

        const workgroupCount = Math.ceil(GRID_SIZE / WORKGROUP_SIZE)
        computePass.dispatchWorkgroups(workgroupCount, workgroupCount)

        computePass.end()

        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: context!.getCurrentTexture().createView(),
              loadOp: 'clear',
              clearValue: { r: 0, g: 0, b: 0, a: 1.0 },
              storeOp: 'store',
            },
          ],
        })

        step++ // Increment the step count

        // Draw the grid.
        pass.setPipeline(cellPipeline)
        pass.setBindGroup(0, bindGroups[step % 2])
        pass.setVertexBuffer(0, vertexBuffer)
        pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE)

        // End the render pass and submit the command buffer
        pass.end()
        device.queue.submit([encoder.finish()])
        // requestAnimationFrame(render)
      }

      renderIntervalRef = setInterval(() => {
        if (pauseRef.current) {
          return
        }

        render()
      }, UPDATE_INTERVAL)

      // render()

      return device
    }

    initGOL()
      .then((device) => device.lost)
      .then((info) => {
        if (info.reason === 'destroyed') {
          console.info(`WebGPU device was destroyed intentionally.`)
        } else {
          // try again
          initGOL()
          console.error(`WebGPU device was lost: ${info.message}`)
        }
      })

    return () => {
      deviceRef?.destroy()
      clearInterval(renderIntervalRef)
    }
  }, [pauseRef, resetCount, gridSizeDebounced])

  const playPauseRendering = useCallback(() => {
    pauseRef.current = !pauseRef.current
    setIsPaused(pauseRef.current)
  }, [pauseRef, setIsPaused])

  if (error) {
    throw error
  }

  return (
    <>
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="aspect-square w-2/4"></canvas>
      </div>
      <div className="mt-6 flex justify-center">
        <div className="join">
          <button type="button" className="btn join-item" onClick={playPauseRendering}>
            {!isPaused ? (
              <>
                <PauseIcon className="mr-2 h-6 w-6" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="mr-2 h-6 w-6" />
                Play
              </>
            )}
          </button>
          <button
            type="button"
            className="btn join-item"
            onClick={() => {
              setResetCount(resetCount + 1)
              if (isPaused) playPauseRendering()
            }}
          >
            <ArrowPathIcon className="mr-2 h-6 w-6" />
            Reset
          </button>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center">
        Grid size: {gridSize}
        <input
          type="range"
          className="range ml-4"
          min="16"
          max="128"
          step="2"
          onChange={(event) => setGridSize(+event.target.value)}
          value={gridSize}
        />
      </div>
    </>
  )
}

export default withErrorBoundary(WebGPUGameOfLife, {
  fallback: (
    <div className="alert alert-error">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 26C22.9 26 22 25.1 22 24V16C22 14.9 22.9 14 24 14C25.1 14 26 14.9 26 16V24C26 25.1 25.1 26 24 26ZM26 34H22V30H26V34Z"
          fill="#E92C2C"
        />
      </svg>
      <div className="flex flex-col">
        <span>Error</span>
        <span className="text-content2">Your browser/device doesn't support WebGPU</span>
      </div>
    </div>
  ),
})
