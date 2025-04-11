import OSDetector from './OSDetector';

class TinyMCEAccessabilityHelper {
  private message: string;
  private AltMsg = 'Press Alt 0 for accessibility shortcuts.';
  private optMsg = 'Press Option 0 for accessibility shortcuts.';

  constructor() {
    const osDetector = new OSDetector();
    const currentOS = osDetector.getOS();
    this.message = this.getMessageForOS(currentOS);
  }

  private getMessageForOS(os: string): string {
    switch (os) {
      case 'Windows':
        return this.AltMsg;
      case 'Mac':
        return this.optMsg;
      case 'Linux':
        return this.AltMsg;
      default:
        return '';
    }
  }

  public getMessage(): string {
    return this.message;
  }
}

export default TinyMCEAccessabilityHelper;
