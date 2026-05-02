export interface Postal {
  id: string;
  year: number;
  city: string;
  /** Optional note (e.g. "Casament Toneta i Maneló") */
  note?: string;
}

/** Computed: filenames follow the [id]-c.avif / [id]-d.avif convention */
export function postalCaraFilename(id: string) {
  return `${id}-c.avif`;
}
export function postalDorsFilename(id: string) {
  return `${id}-d.avif`;
}

export interface Cartell {
  year: number;
  /** Local asset require() or undefined if not yet added */
  asset?: number;
  /** Fallback blurhash while image loads */
  blurhash?: string;
}
