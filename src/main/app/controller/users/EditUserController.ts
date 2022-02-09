import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import autobind from 'autobind-decorator';
import {User} from '../../../types/User';
import {EditUserPageData, SearchUserPageData} from '../../../types/UserPageData';
import {AxiosError} from 'axios';

@autobind
export class EditUserController {

  searchErrorMsg = 'A problem occurred when searching for the user. '
  userNotFoundErrorMsg = 'No account was found for user:'

  public async renderSearchUser(req: AuthedRequest,
    res: Response,
    updated = false,
    userEmail= '',
    errors: { text: string }[] = []): Promise<void> {

    const pageData: SearchUserPageData = {
      userEmail: userEmail,
      errors: errors,
      updated: updated
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
      updated: updated,
      user : user
    };
    return res.render('users/tabs/editUserContent', pageData);
  }

  public async getUser(req: AuthedRequest,
    res: Response,
    updated: false,
    errors: { text: string }[] = [],
    user: User = null): Promise<void> {

    const userEmail: string = req.query.userEmail as string;

    await req.scope.cradle.idamApi.getUserByEmail(userEmail, req.session.user.access_token)
      .then((returnedUser: User) => {
        this.renderEditUser(req,res, false, returnedUser, []);
      })
      .catch(async (reason: AxiosError) => {
        // // Do we need a different error is user isn't found? How do we access error code?
        // if (res.statusCode === 404) {
        //   return await this.renderSearchUser(req, res, false, userEmail, [{ text: `${this.userNotFoundErrorMsg} ${userEmail}.` }]);
        // }
        return await this.renderSearchUser(req, res, false, userEmail,[{ text: this.searchErrorMsg }]);
      });
  }

  public async patchUser(req: AuthedRequest,
    res: Response,
    updated: false,
    errors: { text: string }[] = [],
    user: User = null): Promise<void> {

    const userId = req.body.userId;
    const forename = req.body.forename;
    const surname = req.body.surname;

    await req.scope.cradle.idamApi.updateUserDetails(userId, forename, surname, req.session.user.access_token)
      .then((returnedUser: User) => {
        console.log(returnedUser);
      })
      .catch(async (reason: AxiosError) => {
        return await this.renderSearchUser(req, res, false, '', [{ text: this.searchErrorMsg }]);
      });

    // await req.scope.cradle.idamApi.updateUserRole(userId, roleId, req.session.user.access_token)
    //   .then(() => {
    //     console.log(res);
    //   })
    //   .catch(async (reason: AxiosError) => {
    //     return await this.renderSearchUser(req, res, false, '', [{ text: this.searchErrorMsg }]);
    //   });

  }


}
