import axios, { RawAxiosRequestHeaders, AxiosResponse } from 'axios';
import PQueue from 'p-queue';
import { Video } from 'playwright';
import { API } from './shiki.consts';
import {
  AnimeSimple,
  AnimeRequest,
  ShikiConfig,
  Anime,
  Screenshot,
  UserBrief,
} from './shiki.interface';

const RATE_PER_SECOND = 5;
const RATE_PER_MINUTE = 90;
const RATE_FAULT_CORRECTION = 0.95;

/**
 * If we give an ability to use max rps (5 requests per second), we run out the limit for
 * one minute witch is 90 requests (5*18 = 90). So there we give an ability to use max
 * possible request speed for first 5 requests, but interval is ~3.3 seconds, so the max
 * interval per minute is 60s/3.3s*5r = ~90rpm;
 *
 * After measuring I got about 95.4rpm (1.59rps) instead of 90rpm so I added correction to
 * decrease max rpm by 5% and avoid potential ban.
 */
const queue = new PQueue({
  concurrency: 1,
  interval: Math.ceil(
    (1000 * 60) / ((RATE_PER_MINUTE * RATE_FAULT_CORRECTION) / RATE_PER_SECOND)
  ),
  intervalCap: RATE_PER_SECOND,
});

export class Shiki {
  static get<T = unknown>(
    url: string,
    params?: string | URLSearchParams | string[][] | Record<string, string>,
    config?: ShikiConfig
  ): Promise<AxiosResponse<T>> {
    return queue.add(() => {
      const request = `${config?.apiUrl ?? API}/${url}${
        params ? `?${new URLSearchParams(params).toString()}` : ''
      }`;
      return axios.get<string, AxiosResponse<T>, undefined>(request, {
        headers: this.getHeaders(config),
      });
    });
  }

  static post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: ShikiConfig
  ): Promise<AxiosResponse<T>> {
    return queue.add(() => {
      return axios.post<string, AxiosResponse<T>, D>(
        `${config?.apiUrl ?? API}/${url}`,
        data,
        {
          headers: this.getHeaders(config),
        }
      );
    });
  }

  static put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: ShikiConfig
  ): Promise<AxiosResponse<T>> {
    return queue.add(() => {
      return axios.put<string, AxiosResponse<T>, D>(
        `${config?.apiUrl ?? API}/${url}`,
        data,
        {
          headers: this.getHeaders(config),
        }
      );
    });
  }

  static patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: ShikiConfig
  ): Promise<AxiosResponse<T>> {
    return queue.add(() => {
      return axios.patch<string, AxiosResponse<T>, D>(
        `${config?.apiUrl ?? API}/${url}`,
        data,
        {
          headers: this.getHeaders(config),
        }
      );
    });
  }

  static delete<T = unknown>(
    url: string,
    config?: ShikiConfig
  ): Promise<AxiosResponse<T>> {
    return axios.delete<string, AxiosResponse<T>, undefined>(
      `${config?.apiUrl ?? API}/${url}`,
      {
        headers: this.getHeaders(config),
      }
    );
  }

  /**
   * List with one random anime
   */
  static animes(): Promise<AnimeSimple[]>;
  /**
   * List animes
   */
  static animes(
    request: AnimeRequest,
    config?: ShikiConfig
  ): Promise<AnimeSimple[]>;
  static animes(
    request?: AnimeRequest,
    config?: ShikiConfig
  ): Promise<AnimeSimple[]> {
    const requestWithString = Object.keys(request).reduce(
      (requestCopy, key) => {
        requestCopy[key] = request[key].toString();
        return requestCopy;
      },
      {}
    );
    return this.get<AnimeSimple[]>('animes', requestWithString, config).then(
      (response) => response.data
    );
  }

  /**
   * Show an anime
   * @param request id of anime
   */
  static anime(request: number, config?: ShikiConfig): Promise<Anime>;
  /**
   * Get characters of this anime
   * @toto not implemented yet
   * @param request id of anime
   * @param subRequest 'roles'
   */
  static anime(
    request: number,
    subRequest: 'roles',
    config?: ShikiConfig
  ): Promise<AnimeSimple[]>;
  /**
   * Get similar animes
   * @param request id of anime
   * @param subRequest 'similar'
   */
  static anime(
    request: number,
    subRequest: 'similar',
    config?: ShikiConfig
  ): Promise<AnimeSimple[]>;
  /**
   * Get related animes
   * @param request id of anime
   * @param subRequest 'related'
   */
  static anime(
    request: number,
    subRequest: 'related',
    config?: ShikiConfig
  ): Promise<AnimeSimple[]>;
  /**
   * Get screenshots of anime
   * @param request id of anime
   * @param subRequest 'screenshots'
   */
  static anime(
    id: number,
    subRequest: 'screenshots',
    config?: ShikiConfig
  ): Promise<Screenshot[]>;
  /**
   * Get videos of anime
   * @param request id of anime
   * @param subRequest 'videos'
   * @deprecated Use Videos API instead
   */
  static anime(
    request: number,
    subRequest: 'videos',
    config?: ShikiConfig
  ): Promise<Video[]>;
  /**
   * @toto not implemented yet
   * @param request id of anime
   * @param subRequest 'franchise'
   */
  static anime(
    id: number,
    subRequest: 'franchise',
    config?: ShikiConfig
  ): Promise<AnimeSimple[]>;
  /**
   * @toto not implemented yet
   * @param request id of anime
   * @param subRequest 'external_links'
   */
  static anime(
    id: number,
    subRequest: 'external_links'
  ): Promise<AnimeSimple[]>;
  /**
   * @toto not implemented yet
   * @param request id of anime
   * @param subRequest 'topics'
   */
  static anime(
    id: number,
    subRequest: 'topics',
    config?: ShikiConfig
  ): Promise<AnimeSimple[]>;
  /**
   * @deprecated Use "List animes" API instead
   */
  static anime(request: 'search'): Promise<AnimeSimple[]>;
  static anime(
    request?: AnimeRequest | number | 'search',
    subRequest?:
      | 'roles'
      | 'similar'
      | 'related'
      | 'screenshots'
      | 'videos'
      | 'franchise'
      | 'external_links'
      | 'topics'
      | ShikiConfig,
    config?: ShikiConfig
  ): Promise<AnimeSimple[] | AnimeSimple | Screenshot[] | Video[]> {
    if (!request)
      return this.get<AnimeSimple[]>(
        'animes',
        null,
        <ShikiConfig>subRequest
      ).then((response) => response.data);
    if (request === 'search')
      return this.get<Anime>(
        'animes/search',
        null,
        <ShikiConfig>subRequest
      ).then((response) => response.data);
    if (!subRequest)
      return this.get<AnimeSimple[]>(`animes/${request}`).then(
        (response) => response.data
      );
    if (subRequest === 'similar' || subRequest === 'related')
      return this.get<AnimeSimple[]>(`animes/${request}/${subRequest}`).then(
        (response) => response.data
      );
  }

  static whoami(config: ShikiConfig): Promise<UserBrief> {
    return this.get<UserBrief>('whoami', null, config).then(
      (response) => response.data
    );
  }

  private static getHeaders(config?: ShikiConfig): RawAxiosRequestHeaders {
    if (!config) return {};
    const headers = {};
    if (config.userAgent) headers['User-Agent'] = config.userAgent;
    if (config.accessToken)
      headers['Authorization'] = `Bearer ${config.accessToken}`;
  }
}
