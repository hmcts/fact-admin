import {AuthedRequest} from "../../../types/AuthedRequest";
import {Response} from "express";
import {AddUserPageData} from "../../../types/AccountPageData";
import {Account} from '../../../types/Account';
import {CSRF} from "../../../modules/csrf";
import autobind from "autobind-decorator";
import {AxiosError} from "axios";

@autobind
export class InviteUserController {

  updateErrorMsg = 'A problem occurred when saving the account details. ';
  duplicatedErrorMsg = 'Account already exists. ';
  invalidErrorMsg = 'Invalid account details entered.';
  forbiddenErrorMsg = 'The account does not have the right level of access to create user accounts. '
  notFoundErrorMsg = 'not found.';
  unauthorisedMsg ='unauthorised. ';


  public async get( req: AuthedRequest,
                    res: Response,
                    updated = false,
                    errors:{ text: string }[] = [],
                    account: Account = null): Promise<void> {

    const pageData: AddUserPageData = {
      errors: errors,
      updated: updated,
      isSuperAdmin: req.session.user.isSuperAdmin,
      csrfToken: CSRF.create(),
      account : account
    };
    res.render('account/tabs/inviteUserContent', pageData);
  }


  public async post(req: AuthedRequest, res: Response): Promise<void> {


    let account : Account =  ({email: req.body.email, firstName: req.body.firstName,lastName: req.body.lastName,roles:[req.body.roles] })

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false,[{ text: this.updateErrorMsg }] );
    }
    else
    {
      await req.scope.cradle.api.registerUser(account , req.session.user.access_token)
        .then(async() => await this.get(req, res, true, [], account))
        .catch(async (reason: AxiosError) => {
          await this.get(req, res, false, [{ text: this.returnResponseMessage(reason.response?.status)}], account);
      });
    }

  }

  private returnResponseMessage(status: number ){

    switch (status) {
      case 400:
        return this.invalidErrorMsg;
      case 401 :
        return this.unauthorisedMsg;
      case 404:
        return this.notFoundErrorMsg;
      case 403:
        return this.forbiddenErrorMsg;
      case 409:
        return this.duplicatedErrorMsg;

      default:
        return this.updateErrorMsg;
    }
  }

}
