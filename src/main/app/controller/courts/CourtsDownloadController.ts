import autobind from 'autobind-decorator';
import {Response} from 'express';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Parser} from 'json2csv';
import config from 'config';

@autobind
export class CourtsDownloadController {

  /**
   * GET /courts/download
   */
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const courts = await req.scope.cradle.api.getDownloadCourts();

    const frontEndUrl = config.get('services.frontend.url');
    console.log(frontEndUrl);
    const createUrl = (item: any) => ({
      ...item,
      url: frontEndUrl + '/courts/' + item.slug
    });
    const transforms =  [ createUrl ];
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
        label: 'addresses',
        value: 'addresses'
      },
      {
        label: 'areas of law',
        value: 'areas_of_law'
      },
      {
        label: 'type',
        value: 'court_types'
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
      },
      {
        label: 'emails',
        value: 'emails'
      },
      {
        label: 'contacts',
        value: 'contacts'
      },
      {
        label: 'DX',
        value: 'dx_number'
      },
      {
        label: 'opening times',
        value: 'opening_times'
      },
      {
        label: 'application updates',
        value: 'application_updates'
      }
    ];

    const json2csv = new Parser({fields,transforms});
    const csv = json2csv.parse(courts);
    res.header('Content-Type', 'text/csv');
    const date = new Date();
    const fileName = 'courts-' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '.csv';
    res.attachment(fileName);
    res.send(csv);
  }
}
