<script setup lang="ts">
import { City, Coordinate } from '../../city-core/pkg/'
import { onMounted, ref } from 'vue'

const width = 7
const height = 7
const cols = Array.from({ length: width * 2 - 1 }, (_, i) => Math.floor(i / 2))
const rows = Array.from({ length: height * 2 - 1 }, (_, i) => Math.floor(i / 2))

const blue_pos = ref<[number, number]>([0, 0])
const green_pos = ref<[number, number]>([width - 1, height - 1])

const horizontal_wall = ref<string[][]>([])
const vertical_wall = ref<string[][]>([])

const city: City = City.new(width, height)
const blue_coordinate: Coordinate = city.get_blue_position()
const green_coordinate: Coordinate = city.get_green_position()
blue_pos.value = [blue_coordinate.get_x(), blue_coordinate.get_y()]
green_pos.value = [green_coordinate.get_x(), green_coordinate.get_y()]

horizontal_wall.value = city.get_horizontal_wall()['board_matrix']
vertical_wall.value = city.get_vertical_wall()['board_matrix']

horizontal_wall.value[0][0] = 'Blue'
vertical_wall.value[4][3] = 'Green'

console.log(blue_pos.value, green_pos.value, vertical_wall.value, horizontal_wall.value)
</script>

<template>
  <div class="flex flex-row w-full aspect-square gap-2">
    <div
      v-for="(col, x_index) in cols"
      :key="`col-${x_index}`"
      class="flex flex-col h-full gap-2"
      :class="{ grow: x_index % 2 === 0 }"
    >
      <div
        v-for="(row, y_index) in rows"
        :key="`row-${y_index}`"
        class="flex justify-center items-center rounded-2xl min-w-2 min-h-2"
        :class="{
          grow: y_index % 2 === 0,
          'border-slate-700': x_index % 2 === 0 && y_index % 2 === 0,
          'border-2': x_index % 2 === 0 && y_index % 2 === 0,
          'bg-slate-400':
            (x_index % 2 === 0 && y_index % 2 !== 0 && horizontal_wall[row][col] !== 'Empty') ||
            (x_index % 2 !== 0 && y_index % 2 === 0 && vertical_wall[row][col] !== 'Empty'),
        }"
      >
        <div
          v-if="x_index % 2 === 0 && y_index % 2 === 0"
          class="rounded-full w-[80%] h-[80%]"
          :class="{
            'bg-linear-50': blue_pos[0] === col && blue_pos[1] === row,
            'from-blue-800': blue_pos[0] === col && blue_pos[1] === row,
            'to-cyan-600': blue_pos[0] === col && blue_pos[1] === row,
            'bg-linear-65': green_pos[0] === col && green_pos[1] === row,
            'from-green-800': green_pos[0] === col && green_pos[1] === row,
            'to-emerald-600': green_pos[0] === col && green_pos[1] === row,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
