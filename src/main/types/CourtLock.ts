export interface CourtLock {
  id?: number,
  lock_acquired?: Date,
  user_email?: string,
  court_slug: string
}
