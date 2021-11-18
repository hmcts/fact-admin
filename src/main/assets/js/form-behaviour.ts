import $ from 'jquery';

export class FormBehaviourController {
  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.setUpSubmitEventHandler();
  }

  private setUpSubmitEventHandler(): void {
    $(document).on('keydown', 'input, select', function (event) {
      return event.key != 'Enter';
    });
  }
}
