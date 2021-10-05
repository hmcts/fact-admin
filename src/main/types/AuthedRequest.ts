import {AuthedUser} from '../modules/oidc';
import {Request} from 'express';
import {AwilixContainer} from 'awilix';

interface Auth {
  user?: AuthedUser,
  file?: File
  isAuthenticated: () => boolean,
  scope: AwilixContainer
}

export type AuthedRequest = Auth & Request;
