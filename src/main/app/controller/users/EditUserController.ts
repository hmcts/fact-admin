import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import autobind from 'autobind-decorator';
import {User} from '../../../types/User';
import {EditUserPageData, SearchUserPageData} from '../../../types/UserPageData';
import {AxiosError} from 'axios';

@autobind
export class EditUserController {

  searchErrorMsg = 'A problem occurred when searching for the user. ';
  editErrorMsg = 'A problem occurred when editing the user. ';
  userNotFoundErrorMsg = 'No account was found with the email address:';

  public async renderSearchUser(req: AuthedRequest,
    res: Response,
    updated = false,
    userRolesRemoved = false,
    userEmail= '',
    errors: { text: string }[] = []): Promise<void> {

    const pageData: SearchUserPageData = {
      userEmail: userEmail,
      errors: errors,
      updated: updated,
      userRolesRemoved: userRolesRemoved
    };

    res.render('users/tabs/searchUserContent', pageData);
  }

  public async renderEditUser(req: AuthedRequest,
    res: Response,
    updated = false,
    user: User = null,
    errors: { text: string }[] = []): Promise<void> {

    const pageData: EditUserPageData = {
      errors: errors,
      user : user
    };
    return res.render('users/tabs/editUserContent', pageData);
  }

  public async getUser(req: AuthedRequest,
    res: Response): Promise<void> {
    const userEmail: string = req.params.userEmail as string;
    await req.scope.cradle.idamApi.getUserByEmail(userEmail, req.session.user.access_token)
      .then((returnedUser: User) => {
        if (returnedUser === undefined) {
          return this.renderSearchUser(req, res, false, false, userEmail, [{ text: `${this.userNotFoundErrorMsg} ${userEmail}` }]);
        }
        this.renderEditUser(req,res, false, returnedUser, []);
      })
      .catch(async (reason: AxiosError) => {
        return await this.renderSearchUser(req, res, false, false, userEmail,[{ text: this.searchErrorMsg }]);
      });
  }

  public async patchUser(req: AuthedRequest,
    res: Response,
    errors: { text: string }[] = [],
    user: User = null): Promise<void> {

    const userEmail = req.body.userEmail;
    const forename = req.body.forename;
    const surname = req.body.surname;
    const role = req.body.role.valueOf();
    user = await req.scope.cradle.idamApi.getUserByEmail(userEmail, req.session.user.access_token);
    const roleToRemove = this.getUserRole(user) === '' ? '' : this.getUserRoleToRemove(role[0]['name']);

    if (user.forename !== forename || user.surname !== surname) {
      await req.scope.cradle.idamApi.updateUserDetails(user.id, forename, surname, req.session.user.access_token)
        .then(() => {
          if (role[0]['name'] === this.getUserRole(user)) {
            return this.renderSearchUser(req, res, true, false, '', []);
          } else this.updateUserRole(req, res, user.id, role, roleToRemove);
        })
        .catch(async (reason: AxiosError) => {
          return await this.renderSearchUser(req,res, false, false, '', [{ text: this.editErrorMsg }]);
        });
    } else if (role[0]['name'] !== this.getUserRole(user)) {
      await this.updateUserRole(req, res, user.id, role, roleToRemove)
        .catch(async (reason: AxiosError) => {
          return await this.renderSearchUser(req,res, false, false, '', [{ text: this.editErrorMsg }]);
        });
    } else await this.renderSearchUser(req, res, false, false, '', []);

  }

  public async getDeleteConfirmation(req: AuthedRequest, res: Response): Promise<void> {
    const user = await req.scope.cradle.idamApi.getUserByEmail(req.query.userEmail, req.session.user.access_token);
    const pageData = {
      userId: user.id,
      userEmail: req.query.userEmail,
      userRole: req.query.userRole
    };
    res.render('users/tabs/deleteUserConfirm', pageData);
  }

  public async removeUserRole(req: AuthedRequest, res: Response): Promise<void> {
    const user = await req.scope.cradle.idamApi.getUserByEmail(req.body.userEmail, req.session.user.access_token);
    const roleToRemove = req.body.userRole;
    await req.scope.cradle.idamApi.removeUserRole(user.id, roleToRemove, req.session.user.access_token)
      .then(() => {
        this.renderSearchUser(req, res, false, true, '', []);
      })
      .catch(async (reason: AxiosError) => {
        return await this.renderSearchUser(req, res, false, false, '',[{ text: this.editErrorMsg }]);
      });
  }

  private async updateUserRole(req: AuthedRequest,
    res: Response,
    userId: string,
    role: object,
    roleToRemove: string): Promise<void> {
    await req.scope.cradle.idamApi.grantUserRole(userId, role, req.session.user.access_token)
      .then(async () => {
        if (roleToRemove !== '') {
          await req.scope.cradle.idamApi.removeUserRole(userId, roleToRemove, req.session.user.access_token);
        }
        await this.renderSearchUser(req, res, true, false, '', []);
      })
      .catch(async (reason: AxiosError) => {
        return await this.renderSearchUser(req, res, false, false, '',[{ text: this.editErrorMsg }]);
      });
  }

  private getUserRole(user: User): string {
    if (user.roles.includes('fact-super-admin')) {
      return 'fact-super-admin';
    } else if (user.roles.includes('fact-admin')) {
      return 'fact-admin';
    } else return '';
  }

  private getUserRoleToRemove(role: string): string {
    return role === 'fact-admin' ? 'fact-super-admin' : 'fact-admin';
  }
}

