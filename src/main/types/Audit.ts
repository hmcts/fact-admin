export interface Audit {
  id: number,
  action: Action,
  location: string,
  user_email: string,
  action_data_before: string,
  action_data_after: string,
  creation_time: string
}

export interface Action {
  id: number,
  name: string
}
