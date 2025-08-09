import { Move } from '../../../city-core/pkg/'

export type MatchInfo = {
  room: number
  game_history: Array<Move>
  player_blue: Array<number>
  player_green: Array<number>
  viewers: Array<number>
}
