<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { City, Coordinate, Direction, Move } from '../../city-core/pkg/'
import { API } from '@/services'
import type { SerializedMove } from '@/services/rooms/types'
import { useWebSocket } from '@/composables/useWebSocket'
import type { WebSocketMessage } from '@/stores/websocket'


const { onMessage } = useWebSocket()
const props = defineProps(['color', 'roomId'])

const width = 7
const height = 7

// only use for display
const colsWithGap = Array.from({ length: width * 2 - 1 }, (_, i) => Math.floor(i / 2))
const rowsWithGap = Array.from({ length: height * 2 - 1 }, (_, i) => Math.floor(i / 2))

const bluePos = ref({ x: 0, y: 0 })
const greenPos = ref({ x: 0, y: 0 })

const horizontalWall = ref<string[][]>([])
const verticalWall = ref<string[][]>([])

const possibleMoves = ref<Move[]>([])

const isBlueTurn = ref(true)
const isGameOver = ref(false)
const gameResult = ref<{ winner: 'Blue' | 'Green' | 'Draw', score: { blue: number, green: number } } | null>(null)

const history = ref<Move[]>([])
const currentMoveIndex = ref(0)

const boardContainer = useTemplateRef('board-container')
const mousePos = ref({ x: NaN, y: NaN })
const currentMove = ref({ x: NaN, y: NaN, wall: '' })

let city: City = City.new(width, height)

const resetGame = () => {
  city = City.new(width, height)
  updateGameState()
}

const fullDirection = (dir: string) => {
  if (dir === 'U') return 'Up'
  if (dir === 'D') return 'Down'
  if (dir === 'L') return 'Left'
  if (dir === 'R') return 'Right'
  throw new Error(`Invalid direction: ${dir}`)
}


const intoDirection = (dir: string): Direction => {
  switch (dir) {
    case 'Up':
      return Direction.Up
    case 'Down':
      return Direction.Down
    case 'Left':
      return Direction.Left
    case 'Right':
      return Direction.Right
    default:
      throw new Error(`Invalid direction: ${dir}`)
  }
}

const intoMove = (move): Move => {
  return Move.new(
    Coordinate.new(move.destination.x, move.destination.y),
    intoDirection(move.place_wall)
  )
}

const isCurrentMoveLegal = computed(() => {
  let legal = false
  possibleMoves.value.forEach((move) => {
    if (currentMove.value.x === move.destination.x &&
      currentMove.value.y === move.destination.y &&
      currentMove.value.wall === move.place_wall[0]) {
      legal = true
    }
  })

  return legal
})

const firstMove = () => {
  city.first_move()
  updateGameState()
}

const lastMove = () => {
  city.last_move()
  updateGameState()
}

const previousMove = () => {
  if (city.get_current_move_index() === 0) return
  city.previous_move()
  updateGameState()
}

const nextMove = () => {
  if (city.is_showing_latest()) return
  city.next_move()
  updateGameState()
}


const jumpToMove = (index: number) => {
  if (index < 0 || index > history.value.length) return
  city.jump_to_move(index)
  updateGameState()
}

const updateGameState = () => {
  const blue_coordinate: Coordinate = city.get_blue_position()
  const green_coordinate: Coordinate = city.get_green_position()

  bluePos.value = { x: blue_coordinate.x, y: blue_coordinate.y }
  greenPos.value = { x: green_coordinate.x, y: green_coordinate.y }

  horizontalWall.value = city.get_horizontal_wall()['board_matrix']
  verticalWall.value = city.get_vertical_wall()['board_matrix']

  possibleMoves.value = city.possible_moves()

  isBlueTurn.value = city.blue_turn()
  history.value = city.get_history()
  currentMoveIndex.value = city.get_current_move_index()
  isGameOver.value = city.game_over()

  if (isGameOver.value) {
    gameResult.value = city.game_result()
  }
}

onMessage('Move', (msg: WebSocketMessage) => {
  if (msg.room !== props.roomId) return

  const move = intoMove(JSON.parse(msg.data))
  city.make_move(move, true)
  currentMove.value = { x: NaN, y: NaN, wall: '' }
  updateGameState()
})


const handleMouseMove = (event: MouseEvent) => {
  if (!props.color || isBlueTurn.value !== (props.color === 'blue')) return

  const rect = boardContainer.value?.getClientRects()[0]

  if (!rect) return
  mousePos.value = {
    x: ((event.clientX - rect.x) / rect.width) * width,
    y: ((event.clientY - rect.y) / rect.height) * height,
  }
  currentMove.value = getMouseMove()
}

const handleMouseClick = () => {
  if (!props.color || isBlueTurn.value !== (props.color === 'blue')) return

  const move: SerializedMove = {
    destination: {
      x: currentMove.value.x,
      y: currentMove.value.y,
    },
    place_wall: fullDirection(currentMove.value.wall),
  }

  API.rooms.makeMove(props.roomId, move)
    .then(() => {
      // city.make_move(move, true)
      // updateGameState()
    })
    .catch((error) => {
      console.error('提交移动失败:', error)
    })
  updateGameState()

}


const getMouseMove = () => {

  const rel_x = (mousePos.value.x % 1) - 0.5
  const rel_y = (mousePos.value.y % 1) - 0.5
  let wall = ''

  if (rel_x > 0 && rel_x > rel_y && rel_x > -rel_y) {
    wall = 'R'
  } else if (rel_x < 0 && -rel_x > rel_y && -rel_x > -rel_y) {
    wall = 'L'
  } else if (rel_y > 0) {
    wall = 'D'
  } else if (rel_y < 0) {
    wall = 'U'
  }

  return {
    x: Math.floor(mousePos.value.x),
    y: Math.floor(mousePos.value.y),
    wall: wall,
  }
}

updateGameState()

defineExpose({
  city,
  isBlueTurn,
  resetGame,
  history,
  currentMoveIndex,
  isGameOver,
  gameResult,
  previousMove,
  nextMove,
  firstMove,
  lastMove,
  jumpToMove,
})
</script>

<template>
  <div class="flex flex-row w-full aspect-square gap-1 sm:gap-2 p-3" ref="board-container" @click="handleMouseClick"
    @mousemove="handleMouseMove">
    <div v-for="(col, x_index) in colsWithGap" :key="`col-${x_index}`" class="flex flex-col h-full gap-1 sm:gap-2"
      :class="{ grow: x_index % 2 === 0 }">
      <div v-for="(row, y_index) in rowsWithGap" :key="`row-${y_index}`"
        class="flex justify-center items-center rounded-xl sm:rounded-2xl min-w-2 min-h-2 transition" :class="{
          grow: y_index % 2 === 0,
          'border-slate-700': x_index % 2 === 0 && y_index % 2 === 0,
          'border-2': x_index % 2 === 0 && y_index % 2 === 0,
          'bg-slate-400':
            (x_index % 2 === 0 && y_index % 2 !== 0 && horizontalWall[row][col] !== 'Empty') ||
            (x_index % 2 !== 0 && y_index % 2 === 0 && verticalWall[row][col] !== 'Empty'),
          'bg-slate-400/50':
            isCurrentMoveLegal &&
            ((x_index % 2 === 0 && y_index % 2 !== 0 &&
              (currentMove.wall === 'U' && currentMove.x === col && currentMove.y === row + 1 ||
                currentMove.wall === 'D' && currentMove.x === col && currentMove.y === row)) ||
              (x_index % 2 !== 0 && y_index % 2 === 0 &&
                (currentMove.wall === 'L' && currentMove.x === col + 1 && currentMove.y === row ||
                  currentMove.wall === 'R' && currentMove.x === col && currentMove.y === row))
            )
        }">
        <div v-if="x_index % 2 === 0 && y_index % 2 === 0" class="rounded-full w-[80%] h-[80%] transition" :class="{
          'bg-linear-50 from-blue-700 to-cyan-500': bluePos.x === col && bluePos.y === row,
          'bg-linear-65 from-green-700 to-emerald-500': greenPos.x === col && greenPos.y === row,
          'bg-linear-40 from-blue-700/50 to-cyan-500/50': isCurrentMoveLegal && isBlueTurn && currentMove.x === col && currentMove.y === row,
          'bg-linear-55 from-green-700/50 to-emerald-500/50': isCurrentMoveLegal && !isBlueTurn && currentMove.x === col && currentMove.y === row,
        }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
