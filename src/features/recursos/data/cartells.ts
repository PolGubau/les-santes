import type { Cartell } from '../types';

/**
 * Festival poster catalogue.
 * Add `asset: require('@/assets/postals/cartell-YEAR.jpg')` as files are added.
 * Years without an asset show a placeholder.
 */
export const CARTELLS: Cartell[] = [
  { year: 2025, blurhash: 'L6B;DR-;IU?bx]t7t7WB-;_3t7WB' },
  { year: 2024, blurhash: 'L6B;DR-;IU?bx]t7t7WB-;_3t7WB' },
  { year: 2023, blurhash: 'L6B;DR-;IU?bx]t7t7WB-;_3t7WB' },
  { year: 2022, blurhash: 'L6B;DR-;IU?bx]t7t7WB-;_3t7WB' },
  { year: 2021, asset: require('@/assets/postals/postal-2021.jpg'), blurhash: 'L4ADf900?bIU?bt7t7WB00-;RjWB' },
  { year: 2019, blurhash: 'L6B;DR-;IU?bx]t7t7WB-;_3t7WB' },
  { year: 2018, blurhash: 'L6B;DR-;IU?bx]t7t7WB-;_3t7WB' },
  { year: 2017, blurhash: 'L6B;DR-;IU?bx]t7t7WB-;_3t7WB' },
  { year: 2016, blurhash: 'L6B;DR-;IU?bx]t7t7WB-;_3t7WB' },
  { year: 2015, blurhash: 'L6B;DR-;IU?bx]t7t7WB-;_3t7WB' },
];
