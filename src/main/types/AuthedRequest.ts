//import {AuthedUser} from '../modules/oidc';
import {Request} from 'express';
import {AwilixContainer} from 'awilix';
import { TokenSet } from 'openid-client';
import { User } from './User';
import {Session} from "express-openid-connect";
//import { FactApi } from '../app/fact/FactApi';

// interface Auth {
//   user?: AuthedUser,
//   file?: File
//   isAuthenticated: () => boolean,
//   scope: AwilixContainer
// }

//export type AuthedRequest = Auth & Request;
export type AuthedRequest = { appSession: AppSession; file?: File; isAuthenticated: () => boolean; scope: AwilixContainer } & Request;
export type AppSession = Session & TokenSet & { user: User };
