import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import autobind from 'autobind-decorator';
import {User} from '../../../types/User';
import {EditUserPageData, SearchUserPageData} from '../../../types/UserPageData';
import {AxiosError} from 'axios';

@autobind
export class EditUserController {

  searchErrorMsg = 'A problem occurred searching for the user. '

  public async renderSearchUser(req: AuthedRequest,
    res: Response,
    updated = false,
    errors: { text: string }[] = []): Promise<void> {

    const pageData: SearchUserPageData = {
      errors: errors,
      updated: updated
    };

    res.render('users/tabs/searchUserContent', pageData);
  }

  public async getUser(req: AuthedRequest,
    res: Response,
    updated: false,
    errors: { text: string }[] = [],
    user: User = null): Promise<void> {

    const userEmail: string = req.query['userEmail'] as string;

    // console.log(req.query);
    // console.log(req);
    console.log('from controller: ' + userEmail);

    await req.scope.cradle.idamApi.getUserByEmail(userEmail, req.session.user.access_token)
      // .then(() => res.render('users/tabs/searchUserContent'))
      .then((returnedUser: User) => {
        console.log('api response');
        // console.log(res);
        console.log(res.statusCode);
        // console.log(res.json);
        console.log(returnedUser);

        res.render('users/tabs/searchUserContent');
      })
      .catch(async (reason: AxiosError) => {
        // console.log(reason);
        return await this.renderSearchUser(req, res, false, [{ text: this.searchErrorMsg }]);
      });

    const pageData: EditUserPageData = {
      errors: errors,
      updated: updated,
      user : user
    };
    res.render('users/tabs/editUserContent', pageData);
  }


}
