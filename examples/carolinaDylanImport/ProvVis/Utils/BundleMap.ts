export type Bundle = {
  metadata: any;
  bundleLabel: string;
  bunchedNodes: string[];
};

export type BundleMap = { [key: string]: Bundle };
