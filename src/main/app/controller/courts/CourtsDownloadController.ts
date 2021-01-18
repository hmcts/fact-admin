import autobind from 'autobind-decorator';
import {Response} from 'express';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Parser} from 'json2csv';

@autobind
export class CourtsDownloadController {

  /**
   * GET /courts/download
   */
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const courts = await req.scope.cradle.api.getDownloadCourts();

    const fields = [
      {
        label: 'name',
        value: 'name'
      },
      {
        label: 'open',
        value: 'open'
      },
      {
        label: 'updated',
        value: 'updated'
      },
      {
        label: 'address',
        value: 'address'
      },
      {
        label: 'areas of law',
        value: 'areas of law'
      },
      {
        label: 'court types',
        value: 'types'
      },
      {
        label: 'crown court code',
        value: 'crown_court_code'
      },
      {
        label: 'county court code',
        value: 'county_court_code'
      },
      {
        label: 'magistrates court code',
        value: 'magistrates_court_code'
      },
      {
        label: 'facilities',
        value: 'facilities'
      },
      {
        label: 'url',
        value: 'url'
      }
    ];

    const json2csv = new Parser({fields});
    const csv = json2csv.parse(courts);
    res.header('Content-Type', 'text/csv');
    const date = new Date();
    const fileName = 'courts-' + date.getFullYear() + '-' + date.getMonth() + 1 + '-' + date.getDate() + '.csv';
    res.attachment(fileName);
    res.send(csv);
  }

}
