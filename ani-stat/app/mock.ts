import * as nock from 'nock';

const ANIME1 = {
  id: 30392,
  name: 'Joukyou Monogatari',
  russian: 'Токийская история',
  image: {
    original: '/system/animes/original/30392.jpg?1664827643',
    preview: '/system/animes/preview/30392.jpg?1664827643',
    x96: '/system/animes/x96/30392.jpg?1664827643',
    x48: '/system/animes/x48/30392.jpg?1664827643',
  },
  url: '/animes/30392-joukyou-monogatari',
  kind: 'movie',
  score: '5.65',
  status: 'released',
  episodes: 1,
  episodes_aired: 0,
  aired_on: '1999-01-01',
  released_on: null,
};

const ANIME2 = {
  id: 34134,
  name: 'One Punch Man 2nd Season',
  russian: 'Ванпанчмен 2',
  image: {
    original: '/system/animes/original/34134.jpg?1672627770',
    preview: '/system/animes/preview/34134.jpg?1672627770',
    x96: '/system/animes/x96/34134.jpg?1672627770',
    x48: '/system/animes/x48/34134.jpg?1672627770',
  },
  url: '/animes/z34134-one-punch-man-2nd-season',
  kind: 'tv',
  score: '7.48',
  status: 'released',
  episodes: 12,
  episodes_aired: 12,
  aired_on: '2019-04-10',
  released_on: '2019-07-03',
};

export class Mock {
  scope: nock.Scope;

  constructor() {
    this.scope = nock('https://shikimori.one')
      .get('/api/animes')
      .reply(200, [ANIME1, ANIME2])
      .get('/api/animes')
      .query({ limit: 50, page: 1, order: 'id' })
      .reply(
        200,
        Array(50)
          .fill({})
          .map((value, index) => (index % 2 ? ANIME1 : ANIME2))
      )
      .get('/api/animes')
      .query({ limit: 50, page: 2, order: 'id' })
      .reply(200, [ANIME1, ANIME2])
      .get('/api/animes')
      .query({ limit: 50, page: 3, order: 'id' })
      .reply(200, [])
      .persist();
  }
}
