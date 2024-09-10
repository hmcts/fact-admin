/// <reference types='codeceptjs' />
type FactApiHelper = import('./helpers/FactApiHelper');

declare namespace CodeceptJS {
  interface SupportObject {
    I: I;
    current: any
    login: (role: string) => void
  }
  interface I extends WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
