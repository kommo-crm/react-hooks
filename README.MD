# @packages/react-hooks

> A collection of useful React Hooks created for use in different [Kommo](https://www.kommo.com/) projects

## Installation

| npm                            | yarn                              | pnpm                              |
| ------------------------------ | --------------------------------- | --------------------------------- |
| `npm i @kommo-crm/react-hooks` | `yarn add @kommo-crm/react-hooks` | `pnpm add @kommo-crm/react-hooks` |

## Hooks

- `useConst` - [Docs](./src/useConst/__docs__/README.md)
- `useDebounce` - [Docs](./src/useDebounce/__docs__/README.md)
- `useDidUpdateEffect` - [Docs](./src/useDidUpdateEffect/__docs__/README.md)
- `useKeyboardListNavigation` - [Docs](./src/useKeyboardListNavigation/__docs__/README.md)
- `useIsComponentMounted` - [Docs](./src/useIsComponentMounted/__docs__/README.md)
- `useOnOutsideClick` - [Docs](./src/useOnOutsideClick/__docs__/README.md)
- `useDeepCompareEffect` - [Docs](./src/useDeepCompareEffect/__docs__/README.md)

## Commands

### Install dependencies and build

```sh
yarn install && yarn build
```

### Storybook Commands

To test your hooks we recommend to use Storybook.

| Command                | Runs                               |
| ---------------------- | ---------------------------------- |
| `yarn storybook`       | Start Storybook on port 6006       |

## Testing

**Run Unit tests:**

```sh
yarn test
```

## Contribute to this repo

Pull requests are welcome. See the [contribution guidelines](./.github/CONTRIBUTING.md) for more information.

## Licenses

Source code is under a [custom license](./LICENCE) based on MIT.
