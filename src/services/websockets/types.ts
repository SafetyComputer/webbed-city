export type ServerMessage = {
  command: 'Chat' | 'Move' | 'Match' | 'End' | 'Join' | 'Leave'
  room: number
  data: string
}
