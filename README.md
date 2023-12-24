<p align="center">
  <a href="http://github.com/wolfpackthatcodes/vite-typescript-package-toolkit">
    <img src="./images/banner.png" alt="banner" width="100%">
  </a>
</p>

<h4 align="center">
  An expressive, minimal wrapper around the Fetch() API.
</h4>

<p align="center">
  <a href="#about">About</a> •
  <a href="#disclaimer">Disclaimer</a> •
  <a href="#install">Install</a> •
  <a href="#how-to-use">How To Use</a>
</p>
<p align="center">
  <a href="#changelog">Changelog</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#security-vulnerabilities">Security Vulnerabilities</a> •
  <a href="#Sponsor">Sponsor</a> •
  <a href="#license">License</a>
</p>

## About

HTTP Client is an expressive, minimal wrapper around the [Fetch()](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API allowing you to quickly make HTTP requests. The HTTP Client utilizes the [Builder creational design pattern](https://refactoring.guru/design-patterns/builder) to provide descriptive methods to construct your Fetch API request.

## Disclaimer

Until HTTP Client reaches a 1.0.0 release, breaking changes will be released with a new minor version.

## Install

You can install HTTP Client from npm registry and GitHub Packages.

```shell
npm install @wolfpackthatcodes/http-client
```

To install HTTP Client from GitHub Packages, follow the steps in the GitHub documentation for [installing a package](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package).

## How To Use

This project is a work-in-progress. Code and documentation are currently under development and are subject to change.

#### Making requests

Since the HTTP Client is a wrapper for Fetch() API, you can still make `HEAD`, `GET`, `POST`, `PUT`, `PATCH`, `DELETE` requests using the respectively helper methods provided.

All request helper methods return a promise that resolves with a [Response object](https://developer.mozilla.org/en-US/docs/Web/API/Response).

##### Send a HEAD request.

Let's see how to make a basic `HEAD` request to another URL:

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient().head('https://api.example.local');
```

##### Send a GET request.

Let's see how to make a basic `GET` request to another URL:

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient().get('https://api.example.local/users');
```

##### Send a GET request with query parameters

When making `GET` requests, you may either append a query string to the URL directly or pass an object of key / value pairs as the second argument to the `get` method:

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient()
  .get('https://api.example.local/users', { page: 1, limit: 10 });
```

Alternatively, the `withQueryParameters` method may be used:

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient()
  .withQueryParameters({ page: 1, limit: 10 })
  .get('https://api.example.local/users');
```

#### Send request with data

You can send additional data with your `POST`, `PUT`, and `PATCH` requests. These methods accept either a string or an object of data as their second argument.

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient()
  .post('https://api.example.local/users/1/notes', 'Example text.');
```

By default, data will be sent with a header of `Content-Type: text/plain`. 

##### Send data as JSON

If you would like to send data using the `application/json` content type, you can use the `asJson` method before making your request:

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient()
  .asJson()
  .patch('https://api.example.local/users/1', { first_name: 'Luis', last_name: 'Aveiro' });
```

##### Send data as URLSearchParams

If you would like to send data using the `application/x-www-form-urlencoded` content type, you can use the `asUrlEncoded` method before making your request:

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient()
  .asUrlEncoded()
  .put('https://api.example.local/users/1', { first_name: 'Luis', last_name: 'Aveiro' });
```

##### Send data as FormData

If you would like to send data using the `multipart/form-data` content type, you can use the `asForm` method before making your request:

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient()
  .asForm()
  .post('https://api.example.local/users', { first_name: 'Luis', last_name: 'Aveiro' });
```

#### Headers

You can add multiple headers to the request by using the `withHeaders` method. The `withHeaders` method accepts an object of key / value pairs:

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient()
  .withHeaders({
    'X-Header': 'value',
    'Y-Header': 'value',
  })
  .get('https://api.example.local/users');
```

Alternatively, use `withHeader` method to include individual headers.

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient()
  .withHeader('X-Header', 'value')
  .get('https://api.example.local/users');
```

##### Replace headers

The `replaceHeaders` method allow you to replace multiple headers. The `replaceHeaders` method accepts an object of key / value pairs:

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const httpClient = new HttpClient()
  .withHeaders({ 'Content-Type': 'application/xml', Accept: 'application/html' })

const response = httpClient
  .replaceHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' })
  .get('https://api.example.local/users');
```

Alternatively, use `replaceHeader` method to replace individual header.

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const httpClient = new HttpClient()
  .withHeaders({ 'Content-Type': 'application/xml', Accept: 'application/html' })

const response = httpClient
  .replaceHeader('Content-Type', 'application/json')
  .get('https://api.example.local/users');
```

##### Define content type accepted

You may use the `accept` method to specify the content type that your application is expecting in response to your request:

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient()
  .accept('application/json')
  .get('https://api.example.local/users');
```

You may use the `acceptJson` method to quickly specify that your application expects the `application/json` content type in response to your request:

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient()
  .acceptJson()
  .get('https://api.example.local/users');
```

#### Authentication

You may specify basic authentication credentials using the `withBasicAuth` and method.

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient()
  .withBasicAuth('luisaveiro', 'secret')
  .get('https://api.example.local/settings');
```

##### Bearer Tokens

If you would like to quickly add a bearer token to the request's Authorization header, you may use the `withToken` method:

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

const response = new HttpClient()
  .withToken('token')
  .get('https://api.example.local/settings');
```

#### Testing

The HTTP Client offers a `fake` method that allows you to instruct the HTTP Client to return mocked responses when requests are made.

```typescript
import { HttpClient } from '@wolfpackthatcodes/http-client';

interface User {
  id: number;
  name: string;
  email: string;
}

function createUserArray(): User[] {
  const users: User[] = [
    { id: 1, name: "John Doe", email: "john.doe@example.com" },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
    { id: 3, name: "Alice Johnson", email: "alice.johnson@example.com" },
    // Add more user objects as needed
  ];

  return users;
}

const mockedResponse = new Response(
  JSON.stringify(createUserArray()),
  { status: 200, headers: new Headers({ 'Content-Type': 'application/json' }) }
);

const response = new HttpClient()
  .fake('https://api.example.local/users', mockedResponse)
  .acceptJson()
  .get('https://api.example.local/users');
```

## Changelog

Please see [CHANGELOG](https://github.com/wolfpackthatcodes/typescript-http-client/blob/main/CHANGELOG.md) for more information on what has changed recently.

## Contributing

We encourage you to contribute to **_HTTP Client_**! Contributions are what makes the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please check out the [contributing to HTTP Client guide](https://github.com/wolfpackthatcodes/typescript-http-client/blob/main/.github/CONTRIBUTING.md) for guidelines about how to proceed.

## Security Vulnerabilities

Trying to report a possible security vulnerability in **_HTTP Client_**? Please check out our [security policy](https://github.com/wolfpackthatcodes/typescript-http-client/blob/main/.github/SECURITY.md) for guidelines about how to proceed.

## Sponsor

Do you like this project? Support it by donating.

<a href="https://www.buymeacoffee.com/luisaveiro">
  <img src="./images/bmc-button.svg" alt="Code Review" width="144">
</a>

## License

The MIT License (MIT). Please see [License File](https://github.com/wolfpackthatcodes/typescript-http-client/blob/main/LICENSE) for more information.
