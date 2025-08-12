export type MatchInfo = {
  room: number
  game_history: Array<SerializedMove>
  player_blue: Array<number>
  player_green: Array<number>
  viewers: Array<number>
}


export type SerializedMove = {
  destination: {
    x: number
    y: number
  }
  place_wall: string
}
