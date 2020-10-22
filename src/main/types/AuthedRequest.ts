import { I18nRequest } from './I18nRequest';
import { AuthedUser } from '../modules/passport';

interface Auth {
  user?: AuthedUser,
  isAuthenticated: () => boolean
}

export type AuthedRequest = I18nRequest & Auth;
