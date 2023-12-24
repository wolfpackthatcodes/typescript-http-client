# Changelog

All notable changes to `wolfpackthatcodes/typescript-http-client` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.2.0] - 2023-12-24
### Added
- Support higher node versions.

### Changed
- Upgrade dev dependencies.

### Fixed
- Typo in Readme for FormData example.

## [v0.1.2] - 2023-10-31
### Fixed
- Vite config for generating types entry file.

## [v0.1.1] - 2023-10-31
### Fixed
- Remove invalid type declaration in package.json.

## [v0.1.0] - 2023-10-31
### Added
- `HEAD`, `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` request helper methods.
- `withQueryParameters` method.
- `accept`, `acceptJson`, `asJson`, `asForm`, and `asUrlEncoded` content type methods.
- `withHeaders`, `withHeader`, `replaceHeaders`, `replaceHeader` helper methods.
- `withBasicAuth`, and `withToken` authentication helper methods.
- `fake` method.
