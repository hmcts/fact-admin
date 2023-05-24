import {Request} from 'express';
import {AwilixContainer} from 'awilix';
import { TokenSet } from 'openid-client';
import { User } from './User';
import {Session} from "express-openid-connect";

export type AuthedRequest = { appSession: AppSession; file?: File; isAuthenticated: () => boolean; scope: AwilixContainer } & Request;
export type AppSession = Session & TokenSet & { user: User };
