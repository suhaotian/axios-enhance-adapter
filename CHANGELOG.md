# CHANGELOG

## 0.1.5

- Fix warning: https://publint.dev/axios-enhance-adapter@0.1.4
  The library has types at ./dist/types/index.d.ts but it is not exported from pkg.exports. Consider adding it to pkg.exports.types to be compatible with TypeScript's "moduleResolution": "bundler" compiler option.

## 0.1.4

- GitHub Action npm release 😄

## 0.1.3

- Improve types

## 0.1.1

- Breaking Change: `shouldRetryOnError` change to `(err: AxiosError) => boolean` from `boolean`

## 0.0.13

- Fix: `errorRetryInterval` not working exactly

## 0.0.12

- Add GitHub Repo infomation and author in package.json

## 0.0.11

- Add README.md at npm

## 0.0.10

- Improve README

## 0.0.9

- Useable release 🔥

...

## 0.0.1

- First release 🎉
