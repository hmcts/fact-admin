/// <reference types='codeceptjs' />
type stepsFile = typeof import('./tests/custom-steps.js');

declare namespace CodeceptJS {
  interface SupportObject {
    I: I;
    current: any;
  }

  interface Methods extends Playwright {}

  interface I extends ReturnType<stepsFile>, WithTranslation<Methods> {}

  namespace Translation {
    interface Actions {}
  }
}
