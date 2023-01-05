![Maintained][maintained-badge]
[![Make a pull request][prs-badge]][prs]
[![License][license-badge]](LICENSE.md)

# TODO

[ ] FIX COMMITS
[x] Implement whoami method https://shikimori.one/api/users/whoami
[x] Implement authentication (getting auth code for user)
[√] Use RxJS in all requests
[√] Add mocks
[√] Add store
[ ] Add sqlite
[ ] Make separate file for ipcMain handlers
[ ] App isn't terminated when all windows are closed

# About

Simple app just to analyze some statistic about anime.

This app was create using the template https://github.com/maximegris/angular-electron by [Maxime GRIS](https://github.com/maximegris).

## Project structure

| Folder | Description                                      |
|--------|--------------------------------------------------|
| app    | Electron main process folder (NodeJS)            |
| src    | Electron renderer process folder (Web / Angular) |

[maintained-badge]: https://img.shields.io/badge/maintained-yes-brightgreen
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[prs-badge]: https://img.shields.io/badge/PRs-welcome-red.svg
[prs]: http://makeapullrequest.com
