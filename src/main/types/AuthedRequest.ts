import { AuthedUser } from '../modules/passport';

interface Auth {
  user?: AuthedUser,
  isAuthenticated: () => boolean
}

export type AuthedRequest = Auth;
