<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { City, Coordinate, Move } from '../../city-core/pkg/'
import { API } from '@/services'
import type { SerializedMove } from '@/services/rooms/types'
import { useWebSocket } from '@/composables/useWebSocket'


const { onMessage } = useWebSocket()
const props = defineProps(['color', 'roomId'])

const width = 7
const height = 7

// only use for display
const cols_with_gap = Array.from({ length: width * 2 - 1 }, (_, i) => Math.floor(i / 2))
const rows_with_gap = Array.from({ length: height * 2 - 1 }, (_, i) => Math.floor(i / 2))

const blue_pos = ref({ x: 0, y: 0 })
const green_pos = ref({ x: 0, y: 0 })

const horizontal_wall = ref<string[][]>([])
const vertical_wall = ref<string[][]>([])

const possible_moves = ref<Move[]>([])

const blue_turn = ref(true)
const game_over = ref(false)
const game_result = ref<{ winner: 'Blue' | 'Green' | 'Draw', score: { blue: number, green: number } } | null>(null)

const history = ref<Move[]>([])
// const displayedMoveIndex = ref(0)

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

const isCurrentMoveLegal = computed(() => {
  let legal = false
  possible_moves.value.forEach((move) => {
    if (current_move.value.x === move.destination.x &&
      current_move.value.y === move.destination.y &&
      current_move.value.wall === move.place_wall[0]) {
      legal = true
    }
  })

  return legal
})

const updateGameState = () => {
  const blue_coordinate: Coordinate = city.get_blue_position()
  const green_coordinate: Coordinate = city.get_green_position()

  blue_pos.value = { x: blue_coordinate.x, y: blue_coordinate.y }
  green_pos.value = { x: green_coordinate.x, y: green_coordinate.y }

  horizontal_wall.value = city.get_horizontal_wall()['board_matrix']
  vertical_wall.value = city.get_vertical_wall()['board_matrix']

  possible_moves.value = city.possible_moves()

  blue_turn.value = city.blue_turn()
  history.value = city.get_history()

  game_over.value = city.game_over()

  if (game_over.value) {
    game_result.value = city.game_result()
  }
}

updateGameState()

const board_container = useTemplateRef('board-container')
const mouse_pos = ref({ x: NaN, y: NaN })
const current_move = ref({ x: NaN, y: NaN, wall: '' })

onMounted(() => {
  updateGameState()
})

const handleMouseMove = (event: MouseEvent) => {
  if (!props.color || blue_turn.value !== (props.color === 'blue')) return

  const rect = board_container.value?.getClientRects()[0]

  if (!rect) return
  mouse_pos.value = {
    x: ((event.clientX - rect.x) / rect.width) * width,
    y: ((event.clientY - rect.y) / rect.height) * height,
  }
  current_move.value = getMouseMove()
}

const handleMouseClick = () => {
  if (!props.color || blue_turn.value !== (props.color === 'blue')) return

  const move: SerializedMove = {
    destination: {
      x: current_move.value.x,
      y: current_move.value.y,
    },
    place_wall: fullDirection(current_move.value.wall),
  }

  API.rooms.makeMove(props.roomId, move)
    .then(() => {
      city.make_move(move, true)
      updateGameState()
    })
    .catch((error) => {
      console.error('提交移动失败:', error)
    })

  // city.make_move(move, true)
  // displayedMoveIndex.value += 1
  updateGameState()
}


const getMouseMove = () => {

  const rel_x = (mouse_pos.value.x % 1) - 0.5
  const rel_y = (mouse_pos.value.y % 1) - 0.5
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
    x: Math.floor(mouse_pos.value.x),
    y: Math.floor(mouse_pos.value.y),
    wall: wall,
  }
}

defineExpose({
  blue_turn,
  resetGame,
  history,
  game_over,
  game_result
})
</script>

<template>
  <div class="flex flex-row w-full aspect-square gap-1 sm:gap-2 p-3" ref="board-container" @click="handleMouseClick"
    @mousemove="handleMouseMove">
    <div v-for="(col, x_index) in cols_with_gap" :key="`col-${x_index}`" class="flex flex-col h-full gap-1 sm:gap-2"
      :class="{ grow: x_index % 2 === 0 }">
      <div v-for="(row, y_index) in rows_with_gap" :key="`row-${y_index}`"
        class="flex justify-center items-center rounded-xl sm:rounded-2xl min-w-2 min-h-2 transition" :class="{
          grow: y_index % 2 === 0,
          'border-slate-700': x_index % 2 === 0 && y_index % 2 === 0,
          'border-2': x_index % 2 === 0 && y_index % 2 === 0,
          'bg-slate-400':
            (x_index % 2 === 0 && y_index % 2 !== 0 && horizontal_wall[row][col] !== 'Empty') ||
            (x_index % 2 !== 0 && y_index % 2 === 0 && vertical_wall[row][col] !== 'Empty'),
          'bg-slate-400/50':
            isCurrentMoveLegal &&
            ((x_index % 2 === 0 && y_index % 2 !== 0 &&
              (current_move.wall === 'U' && current_move.x === col && current_move.y === row + 1 ||
                current_move.wall === 'D' && current_move.x === col && current_move.y === row)) ||
              (x_index % 2 !== 0 && y_index % 2 === 0 &&
                (current_move.wall === 'L' && current_move.x === col + 1 && current_move.y === row ||
                  current_move.wall === 'R' && current_move.x === col && current_move.y === row))
            )
        }">
        <div v-if="x_index % 2 === 0 && y_index % 2 === 0" class="rounded-full w-[80%] h-[80%] transition" :class="{
          'bg-linear-50 from-blue-700 to-cyan-500': blue_pos.x === col && blue_pos.y === row,
          'bg-linear-65 from-green-700 to-emerald-500': green_pos.x === col && green_pos.y === row,
          'bg-linear-40 from-blue-700/50 to-cyan-500/50': isCurrentMoveLegal && blue_turn && current_move.x === col && current_move.y === row,
          'bg-linear-55 from-green-700/50 to-emerald-500/50': isCurrentMoveLegal && !blue_turn && current_move.x === col && current_move.y === row,
        }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
