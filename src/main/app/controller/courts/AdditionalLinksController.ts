import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {validateDuplication, validateUrlFormat} from '../../../utils/validation';
import {CSRF} from '../../../modules/csrf';
import {Error} from '../../../types/Error';
import {AdditionalLink, AdditionalLinkData} from '../../../types/AdditionalLink';

@autobind
export class AdditionalLinksController {

  emptyUrlOrDisplayNameErrorMsg = 'URL and display name are required for all additional links.';
  additionalLinkDuplicatedErrorMsg = 'All URLs must be unique.'
  invalidUrlFormatErrorMsg = 'All URLs must be in valid format';
  getAdditionalLinksErrorMsg = 'A problem occurred when retrieving the additional links.';
  updateAdditionalLinksErrorMsg = 'A problem occurred when saving the additional links.';

  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    errorMessages: string[] = [],
    links: AdditionalLink[] = null): Promise<void> {

    const slug: string = req.params.slug as string;

    if (!links) {
      // Retrieve additional links from API and set the isNew property to false on all existing link entries.
      await req.scope.cradle.api.getCourtAdditionalLinks(slug)
        .then((value: AdditionalLink[]) => links = value.map(e => { e.isNew = false; return e; }))
        .catch(() => errorMessages.push(this.getAdditionalLinksErrorMsg));
    }

    if (!links?.some(e => e.isNew === true)) {
      this.addEmptyFormsForNewEntries(links);
    }

    const errors: Error[] = [];
    for (const msg of errorMessages) {
      errors.push({text: msg});
    }

    const pageData: AdditionalLinkData = {
      links: links,
      errors: errors,
      updated: updated
    };
    res.render('courts/tabs/additionalLinksContent', pageData);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let links = req.body.additionalLinks as AdditionalLink[] ?? [];
    links.forEach(l => l.isNew = (l.isNew === true) || ((l.isNew as any) === 'true'));

    if (!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, [this.updateAdditionalLinksErrorMsg], links);
    }

    // Remove fully empty entries
    links = links.filter(e => !this.additionalLinkEntryIsEmpty(e));

    const errorMsg = this.getErrorMessages(links);
    if (errorMsg.length > 0) {
      return this.get(req, res, false, errorMsg, links);
    }

    await req.scope.cradle.api.updateCourtAdditionalLinks(req.params.slug, links)
      .then((value: AdditionalLink[]) => this.get(req, res, true, [], value))
      .catch((err: any) => this.get(req, res, false, [this.updateAdditionalLinksErrorMsg], links));
  }

  private addEmptyFormsForNewEntries(links: AdditionalLink[], numberOfForms = 1): void {
    if (links) {
      for (let i = 0; i < numberOfForms; i++) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        links.push({ url: null, display_name: null, display_name_cy: null, isNew: true });
      }
    }
  }

  private additionalLinkEntryIsEmpty(link: AdditionalLink): boolean {
    return !link.url?.trim() && !link.display_name?.trim() && !link.display_name_cy?.trim();
  }

  private additionalLinkDuplicated(links: AdditionalLink[], index1: number, index2: number): boolean {
    return links[index1].url && links[index1].url.toLowerCase() === links[index2].url.toLowerCase();
  }

  private getErrorMessages(links: AdditionalLink[]): string[] {
    const errorMsg: string[] = [];
    if (links.some(link => link.url === '' || link.display_name === '')) {
      errorMsg.push(this.emptyUrlOrDisplayNameErrorMsg);
    }

    let hasInvalidFormat = false;
    for (const link of links) {
      if (link.url && !validateUrlFormat(link.url)) {
        link.isInvalidFormat = true;
        hasInvalidFormat = true;
      }
    }
    if (hasInvalidFormat) {
      errorMsg.push(this.invalidUrlFormatErrorMsg);
    }

    if (!validateDuplication(links, this.additionalLinkDuplicated)) {
      errorMsg.push(this.additionalLinkDuplicatedErrorMsg);
    }
    return errorMsg;
  }
}
