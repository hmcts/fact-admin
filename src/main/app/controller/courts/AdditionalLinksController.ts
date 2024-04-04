import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {validateDuplication, validateNameDuplication, validateUrlFormat} from '../../../utils/validation';
import {CSRF} from '../../../modules/csrf';
import {Error} from '../../../types/Error';
import {AdditionalLink, AdditionalLinkData} from '../../../types/AdditionalLink';
import {AxiosError} from 'axios';

@autobind
export class AdditionalLinksController {

  emptyUrlErrorMsg = 'URL is required for all additional link ';
  emptyDisplayNameErrorMsg = 'Display name is required for all additional link ';
  urlDuplicatedErrorMsg = 'All URLs must be unique.';
  displayNameDuplicatedErrorMsg = 'All display names must be unique.';
  invalidUrlFormatErrorMsg = 'URL must be in valid format for all additional link';
  getAdditionalLinksErrorMsg = 'A problem occurred when retrieving the additional links.';
  updateAdditionalLinksErrorMsg = 'A problem occurred when saving the additional links.';
  courtLockedExceptionMsg = 'A conflict error has occurred: ';

  /**
   * GET /courts/:slug/additionalLinks
   * render the view with data from database for additional links
   */
  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    errorMessages: Error[] = [],
    links: AdditionalLink[] = null): Promise<void> {

    const slug: string = req.params.slug;
    let fatalError = false;

    if (!links) {
      // Retrieve additional links from API and set the isNew property to false on all existing link entries.
      await req.scope.cradle.api.getCourtAdditionalLinks(slug)
        .then((value: AdditionalLink[]) => links = value.map(e => { e.isNew = false; return e; }))
        .catch(() => {errorMessages.push({text:this.getAdditionalLinksErrorMsg}); fatalError = true;});
    }

    if (!links?.some(e => e.isNew === true)) {
      this.addEmptyFormsForNewEntries(links);
    }

    const errors: Error[] = [];
    for (const msg of errorMessages) {
      errors.push({text: msg.text, href: msg.href});
    }

    const pageData: AdditionalLinkData = {
      links: links,
      errors: errors,
      updated: updated,
      fatalError: fatalError,
    };
    res.render('courts/tabs/additionalLinksContent', pageData);
  }
  /**
   * PUT /courts/:slug/additionalLinks
   * updates the additional links and re-render the view
   */
  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let links = req.body.additionalLinks as AdditionalLink[] ?? [];
    links.forEach(l => l.isNew = (l.isNew === true) || ((l.isNew as any) === 'true'));

    if (!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, [{text:this.updateAdditionalLinksErrorMsg}], links);
    }

    // Remove fully empty entries
    links = links.filter(e => !this.additionalLinkEntryIsEmpty(e));

    const errorMsg = this.getErrorMessages(links);
    if (errorMsg.length > 0) {
      return this.get(req, res, false, errorMsg, links);
    }

    await req.scope.cradle.api.updateCourtAdditionalLinks(req.params.slug, links)
      .then((value: AdditionalLink[]) => this.get(req, res, true, [], value))
      .catch(async (reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.courtLockedExceptionMsg + (<any>reason.response).data['message']
          : this.updateAdditionalLinksErrorMsg;
        await this.get(req, res, false, [{text:error}], links);
      });
  }
  /**
   * adds an empty form so view is rendered with one blank form
   */
  private addEmptyFormsForNewEntries(links: AdditionalLink[], numberOfForms = 1): void {
    if (links) {
      for (let i = 0; i < numberOfForms; i++) {
        links.push({ url: null, display_name: null, display_name_cy: null, isNew: true });
      }
    }
  }
  /**
   * check if additionalLinkEntry is Empty
   */
  private additionalLinkEntryIsEmpty(link: AdditionalLink): boolean {
    return !link.url?.trim() && !link.display_name?.trim() && !link.display_name_cy?.trim();
  }
  /**
   * check if url is duplicated
   */
  private urlDuplicated(links: AdditionalLink[], index1: number, index2: number): boolean {
    return links[index1].url && links[index1].url.toLowerCase() === links[index2].url.toLowerCase();
  }
  /**
   * check if display name is duplicated
   */
  private displayNameDuplicated(links: AdditionalLink[], index1: number, index2: number): boolean {
    return links[index1].display_name && links[index1].display_name.toLowerCase() === links[index2].display_name.toLowerCase();
  }

  /**
   * getErrorMessages
   * @param links - array of AdditionalLink model
   * @return string[] - array of error messages
   */
  private getErrorMessages(links: AdditionalLink[]): Error[] {
    const errorMsg: Error[] = [];

    links.forEach((link, index) => {

      index = index + 1;
      if (link.url === '')
      {
        errorMsg.push({text: (this.emptyUrlErrorMsg +index+'.') , href: '#url-'+ index});
      }
      else if (link.display_name === '')
      {
        errorMsg.push({text: (this.emptyDisplayNameErrorMsg +index+'.') , href: '#display_name-'+ index });
      }
      else if (link.url && !validateUrlFormat(link.url)) {
        link.isInvalidFormat = true;
        errorMsg.push({text: (this.invalidUrlFormatErrorMsg +index+'.') , href: '#url-'+ index});
      }
    });

    if (!validateDuplication(links, this.urlDuplicated)) {
      errorMsg.push({text:this.urlDuplicatedErrorMsg});
    }

    if (!validateNameDuplication(links, this.displayNameDuplicated)) {
      errorMsg.push({text:this.displayNameDuplicatedErrorMsg});
    }
    return errorMsg;
  }
}
