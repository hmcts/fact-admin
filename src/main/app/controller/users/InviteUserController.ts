import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import { AddUserPageData, PasswordPageData} from '../../../types/UserPageData';
import {User} from '../../../types/User';
import {CSRF} from '../../../modules/csrf';
import autobind from 'autobind-decorator';
import {AxiosError} from 'axios';
import {validateEmail} from '../../../utils/validation';

@autobind
export class InviteUserController {

  updateErrorMsg = 'A problem occurred when saving the account details. ';
  invalidPasswordMsg = 'Incorrect password entered . ';
  getEmailAddressFormatErrorMsg = 'Enter an email address in the correct format, like name@example.com'
  emptyErrorMsg = 'All fields are required. '
  duplicatedErrorMsg = 'User with this email already exists. ';
  forbiddenErrorMsg = 'The account does not have the right level of access to create super admin user accounts. '


  public async renderUserInvite(req: AuthedRequest,
    res: Response,
    updated = false,
    errors: { text: string }[] = [],
    user: User = null): Promise<void> {

    const pageData: AddUserPageData = {
      errors: errors,
      updated: updated,
      user : user
    };
    res.render('users/tabs/inviteUserContent', pageData);
  }

  public async renderPassword(req: AuthedRequest,
    res: Response,
    errors: { text: string }[] = [],
    user: User = null): Promise<void> {

    const pageData: PasswordPageData = {
      errors: errors,
      user : JSON.stringify(user)
    };
    res.render('users/tabs/password', pageData);
  }

  public async renderInviteSuccessful(req: AuthedRequest,
    res: Response): Promise<void> {
    res.render('users/tabs/inviteSuccessful');
  }


  public async postUserInvite(req: AuthedRequest, res: Response): Promise<void> {

    const user = req.body.user as User;


    if(!CSRF.verify(req.body._csrf)) {
      return this.renderUserInvite(req, res, false,[{ text: this.updateErrorMsg }] , user);
    }

    const errorMsg = this.getErrorMessages(user);


    if (errorMsg.length > 0) {
      return this.renderUserInvite(req, res, false, errorMsg, user);
    }

    return await this.renderPassword(req, res, [], user);

  }

  public async postPassword (req: AuthedRequest, res: Response): Promise<void> {

    if(!CSRF.verify(req.body._csrf)) {
      return this.renderPassword(req, res, [{ text: this.updateErrorMsg }],JSON.parse(req.body.user) );
    }

    if(req.body.error === 'true') {
      return this.renderPassword(req, res, [{ text: this.invalidPasswordMsg }] ,JSON.parse(req.body.user));
    }

    await req.scope.cradle.idamApi.registerUser(JSON.parse(req.body.user), req.session.user.access_token)
      .then(() => res.render('users/tabs/inviteSuccessful'))
      .catch(async (reason: AxiosError) => {
        return await this.renderUserInvite(req, res, false, [{ text: this.returnResponseMessage(reason.response?.status)}], JSON.parse(req.body.user));
      });
  }

  private getErrorMessages(account: User): {text: string }[] {
    const errorMsg: {text: string }[] = [];
    if (account.email === ''|| account.forename === '' || account.surname === '' || !account.roles ) {
      errorMsg.push({ text: this.emptyErrorMsg});
    }

    // If any address used is not of an email format, return with an error
    if (!(account.email === '')) {
      if (!validateEmail(account)) {
        errorMsg.push({text: this.getEmailAddressFormatErrorMsg});
      }
    }

    return errorMsg;
  }

  private returnResponseMessage(status: number ){

    switch (status) {
      case 400:
        return this.updateErrorMsg;
      case 403:
        return this.forbiddenErrorMsg;
      case 409:
        return this.duplicatedErrorMsg;

      default:
        return this.updateErrorMsg;
    }
  }

}
