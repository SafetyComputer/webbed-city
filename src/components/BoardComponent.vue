<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import { City, Coordinate, Direction, Move } from '../../city-core/pkg/'

const width = 7
const height = 7

const cols_with_gap = Array.from({ length: width * 2 - 1 }, (_, i) => Math.floor(i / 2))
const rows_with_gap = Array.from({ length: height * 2 - 1 }, (_, i) => Math.floor(i / 2))

const blue_pos = ref({ x: 0, y: 0 })
const green_pos = ref({ x: 0, y: 0 })

const horizontal_wall = ref<string[][]>([])
const vertical_wall = ref<string[][]>([])

const blue_turn = ref(true)
const game_over = ref(false)

const history = ref<Move[]>([])

let city: City = City.new(width, height)

const resetGame = () => {
  city = City.new(width, height)
  updateGameState()
}

const directionFromString = (str: string) => {
  if (str === 'U') {
    return Direction.Up
  } else if (str === 'D') {
    return Direction.Down
  } else if (str === 'L') {
    return Direction.Left
  } else if (str === 'R') {
    return Direction.Right
  } else {
    throw new Error(`Invalid direction string: ${str}`)
  }
}

const updateGameState = () => {
  const blue_coordinate: Coordinate = city.get_blue_position()
  const green_coordinate: Coordinate = city.get_green_position()

  blue_pos.value = { x: blue_coordinate.x, y: blue_coordinate.y }
  green_pos.value = { x: green_coordinate.x, y: green_coordinate.y }

  horizontal_wall.value = city.get_horizontal_wall()['board_matrix']
  vertical_wall.value = city.get_vertical_wall()['board_matrix']

  blue_turn.value = city.blue_turn()
  history.value = city.get_history()

  game_over.value = city.game_over()
  if (game_over.value === true) {
    const result = city.game_result()
    alert(`Game Over! ${result['winner']} wins! ${result['score']['blue']} : ${result['score']['green']}`)
  }
}

updateGameState()

const board_container = useTemplateRef('board-container')
const mouse_pos = ref({ x: 0, y: 0 })
const current_move = ref({ x: 0, y: 0, wall: '' })

onMounted(() => {
  const rect = board_container.value?.getClientRects()[0]
  // get mouse DOM position
  board_container.value?.addEventListener('mousemove', (event: MouseEvent) => {
    mouse_pos.value = {
      x: ((event.clientX - rect.x) / rect.width) * width,
      y: ((event.clientY - rect.y) / rect.height) * height,
    }
    current_move.value = getMouseMove()
  })

  board_container.value?.addEventListener('click', (event: MouseEvent) => {
    console.log('Current action:', current_move.value)
    const move = Move.new(
      Coordinate.new(current_move.value.x, current_move.value.y),
      directionFromString(current_move.value.wall),
    )
    console.log(city.make_move(move, true))
    updateGameState()
    console.log(blue_pos.value)
  })
})

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
  history
})
</script>

<template>
  <div class="flex flex-row w-full aspect-square gap-2 p-3" ref="board-container">
    <div v-for="(col, x_index) in cols_with_gap" :key="`col-${x_index}`" class="flex flex-col h-full gap-2"
      :class="{ grow: x_index % 2 === 0 }">
      <div v-for="(row, y_index) in rows_with_gap" :key="`row-${y_index}`"
        class="flex justify-center items-center rounded-2xl min-w-2 min-h-2" :class="{
          grow: y_index % 2 === 0,
          'border-slate-700': x_index % 2 === 0 && y_index % 2 === 0,
          'border-2': x_index % 2 === 0 && y_index % 2 === 0,
          'bg-slate-400':
            (x_index % 2 === 0 && y_index % 2 !== 0 && horizontal_wall[row][col] !== 'Empty') ||
            (x_index % 2 !== 0 && y_index % 2 === 0 && vertical_wall[row][col] !== 'Empty'),
        }">
        <div v-if="x_index % 2 === 0 && y_index % 2 === 0" class="rounded-full w-[80%] h-[80%]" :class="{
          'bg-linear-50': blue_pos.x === col && blue_pos.y === row,
          'from-blue-800': blue_pos.x === col && blue_pos.y === row,
          'to-cyan-600': blue_pos.x === col && blue_pos.y === row,
          'bg-linear-65': green_pos.x === col && green_pos.y === row,
          'from-green-800': green_pos.x === col && green_pos.y === row,
          'to-emerald-600': green_pos.x === col && green_pos.y === row,
        }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
