import { AuthedUser } from '../modules/passport';
import { Request } from 'express';
import { AwilixContainer } from 'awilix';

interface Auth {
  user?: AuthedUser,
  isAuthenticated: () => boolean,
  scope: AwilixContainer
}

export type AuthedRequest = Auth & Request;
