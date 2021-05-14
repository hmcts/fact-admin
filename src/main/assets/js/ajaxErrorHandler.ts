import jqXHR = JQuery.jqXHR;

export class AjaxErrorHandler {
  public static handleError(jqXhr: jqXHR, logMessage: string): void {
    if(jqXhr.status === 302 && jqXhr?.responseJSON?.url) {
      window.location.replace(jqXhr.responseJSON.url);
    } else {
      console.log(logMessage);
    }
  }
}
