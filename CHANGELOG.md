# Changelog

All notable changes to `wolfpackthatcodes/typescript-http-client` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.9.1] - 2024-12-07
### Fixed
- The URL structure would include an unnecessary trailing slash.
- The `buildUrl()` logic to prevent duplicate slashes in the URL structure.
- The detecting Mocked Response URL logic to support the new URL structure.
- Requests that contain form data not sending the data.

## [v0.9.0] - 2024-11-20
### Changed
- Upgrade dev dependencies.

## [v0.8.0] - 2024-10-28
### Changed
- Upgrade dev dependencies.

## [v0.7.4] - 2024-08-10
### Fixed
- typescript:S6582

## [v0.7.3] - 2024-08-10
### Changed
- Upgrade dev dependencies.

## [v0.7.2] - 2024-06-08
### Changed
- Types to be more specific.

### Removed
- Version top-level element in the Docker Compose file.

## [v0.7.1] - 2024-02-13
### Fixed
- Group parts of the regex together to make the intended operator precedence explicit.

## [v0.7.0] - 2024-02-13
### Added
- Index file for TypeScript types.

### Fixed
- Missing AbortSignal option to RequestOptions.
- Missing package export for RequestOptions type.

### Removed
- `PendingRequestBody` instance within the HTTP Client.

## [v0.6.0] - 2024-02-13
### Added
- `timeout` method.

### Fixed
- Replace this trivial promise with "Promise.resolve".

### Removed
- Useless constructors in custom exceptions.

## [v0.5.0] - 2023-12-30
### Added
- `OPTIONS` request helper methods.

## [v0.4.0] - 2023-12-30
### Added
- `retry` and `withUrl` methods.

### Removed
- `PendingRequestUrl` instance within the HTTP Client.

## [v0.3.0] - 2023-12-29
### Added
- `withOption` and `withOptions` helper methods.

### Changed
- The HTTP Client constructor to accept an optional second parameter as an object for Fetch Options.
- `replaceHeader`, `withCredentials`, `withHeader` and `withToken` methods to utilize the withOptions method or the options property.
- `replaceHeaders` and `withHeaders` methods accept Header instances.

### Fixed
- Missing type for mockedResponse variable.

### Removed
- `PendingRequestAuthorization`, `PendingRequestCredentials`, and `PendingRequestHeaders` instances within the HTTP Client.

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
