# Numbro APIs

Use this reference for precise decimal arithmetic and consistent number formatting, especially money, token amounts, rates, percentages, and other business values where plain JavaScript floating point is risky or inconsistent.

## Import

```ts
import { numbro, Numbro } from '@dune2/tools/numbro';
```

`@dune2/tools/numbro` wraps BigNumber.js and provides chainable precise operations plus formatting helpers.

## Creating values

```ts
numbro(123.456);
numbro('1,234.56');
numbro(null); // normalized by the library
```

Prefer string inputs when the source value is already a decimal string and preserving decimal precision matters.

## Basic formatting

```ts
numbro(1234.5678).format();
numbro(1234.5678).format({ mantissa: 2 });
numbro(1234567).format({ thousandSeparated: true });
```

Search the consumer application for existing formatting defaults/options before introducing a new display convention.

## Percentages

```ts
numbro(0.1234).format({
  output: 'percent',
  mantissa: 1,
});
```

Do not manually multiply and concatenate `%` when the existing application uses `numbro` formatting for percentages.

## Compact large numbers

```ts
numbro(1234567).format({
  average: true,
  mantissa: 2,
});
```

This is useful for K/M/B/T-style display. Reuse existing application conventions for precision and suffixes.

## Currency formatting

Use the library's currency formatting helpers rather than combining `toFixed`, string concatenation, and custom separators at each call site.

```ts
numbro(123.456).formatCurrency({ symbol: '$' });
```

Keep presentation currency rules separate from exchange-rate or accounting logic when the application already has domain-specific helpers.

## Rounding

Use explicit `Numbro.RoundingMode` values when the business rule requires a specific rounding policy rather than relying on incidental JavaScript behavior.

```ts
numbro(1.235).format({
  mantissa: 2,
  roundingMode: Numbro.RoundingMode.RoundHalfUp,
});
```

Match existing project rounding rules for prices, balances, fees, percentages, and settlement values.

## Trailing zeros and invalid values

The formatter supports options for trailing-zero handling and custom NaN presentation. Prefer those options over post-processing formatted strings with regular expressions.

Examples:

```ts
numbro('1.20000').format({
  mantissa: 3,
  deleteEndZero: true,
});

numbro(NaN).format({ NaNFormat: '-' });
```

## Precise arithmetic

For decimal business logic, keep calculations inside `numbro`/BigNumber-backed operations rather than converting to native `number`, performing arithmetic, and wrapping the result again.

This matters for values such as:

- money and prices
- crypto/token amounts
- percentages and rates
- fees
- balances
- quantities with decimal precision requirements

## Agent guidance

1. Search for existing `numbro` usage and application-wide formatting options first.
2. Prefer `numbro` over `toFixed`, manual comma insertion, or native floating-point business arithmetic.
3. Preserve decimal strings as strings until they enter the precise-number layer when possible.
4. Use explicit rounding rules when the domain specifies them.
5. Do not invent new currency/percentage conventions when the consumer application already has established helpers or options.
