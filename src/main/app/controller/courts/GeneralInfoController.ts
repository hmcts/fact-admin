import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CourtGeneralInfo, CourtGeneralInfoData} from '../../../types/CourtGeneralInfo';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';

@autobind
export class GeneralInfoController {

  updateGeneralInfoErrorMsg = 'A problem occurred when saving the general information.';
  getGeneralInfoErrorMsg = 'A problem occurred when retrieving the general information.';
  updateDuplicateGeneralInfoErrorMsg = 'All names must be unique.';


  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    error = '',
    duplicatedName = false,
    generalInfo: CourtGeneralInfo = null): Promise<void> {

    const slug: string = req.params.slug as string;

    if (!generalInfo) {
      await req.scope.cradle.api.getGeneralInfo(slug)
        .then((value: CourtGeneralInfo) => generalInfo = value)
        .catch(() => error += this.getGeneralInfoErrorMsg);
    }

    const pageData: CourtGeneralInfoData = {
      generalInfo: generalInfo,
      errorMsg: error,
      updated: updated,
      duplicatedName: duplicatedName
    };

    res.render('courts/tabs/generalContent', pageData);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const generalInfo = req.body as CourtGeneralInfo;
    const slug: string = req.params.slug as string;

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, this.updateGeneralInfoErrorMsg, false, generalInfo);
    }

    if (generalInfo.name.trim() === '') {
      return this.get(req, res, false, this.updateGeneralInfoErrorMsg, false, generalInfo);
    }
    generalInfo.open = generalInfo.open ?? false;
    generalInfo['access_scheme'] = generalInfo['access_scheme'] ?? false;


    await req.scope.cradle.api.updateGeneralInfo(slug, generalInfo)
      .then((value: CourtGeneralInfo) => this.get(req, res, true, '', false, value))
      .catch(async (reason: AxiosError) => {
        await this.get(req, res, false,
          reason.response?.status === 409
            ? this.updateDuplicateGeneralInfoErrorMsg + reason.response?.data
            : this.updateGeneralInfoErrorMsg, true, generalInfo);
      });
  }
}
