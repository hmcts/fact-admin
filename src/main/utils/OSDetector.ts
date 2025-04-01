class OSDetector {
  private osName: string;

  constructor() {
    this.osName = this.detectOS();
  }

  private detectOS(): string {
    if (typeof process !== 'undefined' && process.platform) {
      // Running in a Node.js environment
      switch (process.platform) {
        case 'win32':
          return 'Windows';
        case 'darwin':
          return 'Mac';
        case 'linux':
          return 'Linux';
        default:
          return 'Unknown';
      }
    } else if (typeof navigator !== 'undefined' && navigator.userAgent) {
      // Running in a browser environment
      const userAgent = navigator.userAgent;
      if (/Windows/i.test(userAgent)) return 'Windows';
      if (/Macintosh|Mac OS X/i.test(userAgent)) return 'Mac';
      if (/Linux/i.test(userAgent)) return 'Linux';
      return 'Unknown';
    }
    return 'Unknown';
  }

  public getOS(): string {
    return this.osName;
  }
}

export default OSDetector;
