export interface BuildInfo {
  version: string;
  buildTime: string;
  environment: string;
  gitCommit: string;
}

declare const __BUILD_INFO__: BuildInfo;