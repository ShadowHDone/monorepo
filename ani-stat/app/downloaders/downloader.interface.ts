export interface Downloader {
  run: (first: number, last?: number) => void;
  end: (last?: number) => void;
}
