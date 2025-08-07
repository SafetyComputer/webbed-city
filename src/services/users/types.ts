export type User = {
  id: number
  username: string
  elo: number
}

export type InputCreateUser = {
  username: string
  password: string
}

export type InputLogin = {
  username: string
  password: string
}


export type UserFilter = {
  id?: number
  username?: string
}
