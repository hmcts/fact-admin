import {AuthedRequest} from "../../../types/AuthedRequest";
import {Response} from "express";
import {AccountPageData} from "../../../types/AccountPageData";
import {CSRF} from "../../../modules/csrf";
import autobind from "autobind-decorator";

@autobind
export class InviteUserController {
  public async get(req: AuthedRequest, res: Response): Promise<void> {

    const pageData: AccountPageData = {
      isSuperAdmin: req.session.user.isSuperAdmin,
      csrfToken: CSRF.create()
    };
    res.render('account/tabs/inviteUserContent', pageData);
  }
}
