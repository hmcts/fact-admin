
export interface FeatureFlagClient {
  getFlagValue: (flag: string, defaultValue: boolean) => Promise<boolean>,
  getAllFlagValues: (defaultValue: boolean) => Promise<{ [flag: string]: boolean }>
  onFlagChange: (callback: Function, defaultValue: boolean, flag?: string, ) => void
}
