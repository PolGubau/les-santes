/**
 * Static asset map for postal cards.
 * Metro bundler requires literal require() paths — no dynamic construction.
 * Keys match the `id` field in src/shared/data/postals.json.
 */

/* eslint-disable @typescript-eslint/no-require-imports */

export interface PostalAssets {
	front?: number;
	back?: number;
}

export const POSTAL_ASSETS: Record<string, PostalAssets> = {
	"1985": {
		front: require("../../../assets/resources/postals/1985-c.avif"),
		back: require("../../../assets/resources/postals/1985-d.avif"),
	},
	"1986": {
		front: require("../../../assets/resources/postals/1986-c.avif"),
		back: require("../../../assets/resources/postals/1986-d.avif"),
	},
	"1988": {
		front: require("../../../assets/resources/postals/1988-c.avif"),
		back: require("../../../assets/resources/postals/1988-d.avif"),
	},
	"1989": {
		front: require("../../../assets/resources/postals/1989-c.avif"),
		back: require("../../../assets/resources/postals/1989-d.avif"),
	},
	"1990": {
		front: require("../../../assets/resources/postals/1990-c.avif"),
		back: require("../../../assets/resources/postals/1990-d.avif"),
	},
	"1991": {
		front: require("../../../assets/resources/postals/1991-c.avif"),
		back: require("../../../assets/resources/postals/1991-d.avif"),
	},
	"1992": {
		front: require("../../../assets/resources/postals/1992-c.avif"),
		back: require("../../../assets/resources/postals/1992-d.avif"),
	},
	"1993": {
		front: require("../../../assets/resources/postals/1993-c.avif"),
		back: require("../../../assets/resources/postals/1993-d.avif"),
	},
	"1994": {
		front: require("../../../assets/resources/postals/1994-c.avif"),
		back: require("../../../assets/resources/postals/1994-d.avif"),
	},
	"1995": {
		front: require("../../../assets/resources/postals/1995-c.avif"),
		back: require("../../../assets/resources/postals/1995-d.avif"),
	},
	"1996": {
		front: require("../../../assets/resources/postals/1996-c.avif"),
		back: require("../../../assets/resources/postals/1996-d.avif"),
	},
	"1997": {
		front: require("../../../assets/resources/postals/1997-c.avif"),
		back: require("../../../assets/resources/postals/1997-d.avif"),
	},
	"1998": {
		front: require("../../../assets/resources/postals/1998-c.avif"),
		back: require("../../../assets/resources/postals/1998-d.avif"),
	},
	"1999": {
		front: require("../../../assets/resources/postals/1999-c.avif"),
		back: require("../../../assets/resources/postals/1999-d.avif"),
	},
	"2000": {
		front: require("../../../assets/resources/postals/2000-c.avif"),
		back: require("../../../assets/resources/postals/2000-d.avif"),
	},
	"2001": {
		front: require("../../../assets/resources/postals/2001-c.avif"),
		back: require("../../../assets/resources/postals/2001-d.avif"),
	},
	"2002": {
		front: require("../../../assets/resources/postals/2002-c.avif"),
		back: require("../../../assets/resources/postals/2002-d.avif"),
	},
	"2003": {
		front: require("../../../assets/resources/postals/2003-c.avif"),
		back: require("../../../assets/resources/postals/2003-d.avif"),
	},
	"2004": {
		front: require("../../../assets/resources/postals/2004-c.avif"),
		back: require("../../../assets/resources/postals/2004-d.avif"),
	},
	"2005": {
		front: require("../../../assets/resources/postals/2005-c.avif"),
		back: require("../../../assets/resources/postals/2005-d.avif"),
	},
	"2006": {
		front: require("../../../assets/resources/postals/2006-c.avif"),
		back: require("../../../assets/resources/postals/2006-d.avif"),
	},
	"2007": {
		front: require("../../../assets/resources/postals/2007-c.avif"),
		back: require("../../../assets/resources/postals/2007-d.avif"),
	},
	"2008": {
		front: require("../../../assets/resources/postals/2008-c.avif"),
		back: require("../../../assets/resources/postals/2008-d.avif"),
	},
	"2009": {
		front: require("../../../assets/resources/postals/2009-c.avif"),
		back: require("../../../assets/resources/postals/2009-d.avif"),
	},
	"2010": {
		front: require("../../../assets/resources/postals/2010-c.avif"),
		back: require("../../../assets/resources/postals/2010-d.avif"),
	},
	"2010-vic": {
		front: require("../../../assets/resources/postals/2010-vic-c.avif"),
		back: require("../../../assets/resources/postals/2010-vic-d.avif"),
	},
	"2011": {
		front: require("../../../assets/resources/postals/2011-c.avif"),
		back: require("../../../assets/resources/postals/2011-d.avif"),
	},
	"2012": {
		front: require("../../../assets/resources/postals/2012-c.avif"),
		back: require("../../../assets/resources/postals/2012-d.avif"),
	},
	"2013": {
		front: require("../../../assets/resources/postals/2013-c.avif"),
		back: require("../../../assets/resources/postals/2013-d.avif"),
	},
	"2014": {
		front: require("../../../assets/resources/postals/2014-c.avif"),
		back: require("../../../assets/resources/postals/2014-d.avif"),
	},
	"2015": {
		front: require("../../../assets/resources/postals/2015-c.avif"),
		back: require("../../../assets/resources/postals/2015-d.avif"),
	},
	"2016": {
		front: require("../../../assets/resources/postals/2016-c.avif"),
		back: require("../../../assets/resources/postals/2016-d.avif"),
	},
	"2017": {
		front: require("../../../assets/resources/postals/2017-c.avif"),
		back: require("../../../assets/resources/postals/2017-d.avif"),
	},
	"2018": {
		front: require("../../../assets/resources/postals/2018-c.avif"),
		back: require("../../../assets/resources/postals/2018-d.avif"),
	},
	"2019": {
		front: require("../../../assets/resources/postals/2019-c.avif"),
		back: require("../../../assets/resources/postals/2019-d.avif"),
	},
	"2022": {
		front: require("../../../assets/resources/postals/2022-c.avif"),
		back: require("../../../assets/resources/postals/2022-d.avif"),
	},
	"2023": {
		front: require("../../../assets/resources/postals/2023-c.avif"),
		back: require("../../../assets/resources/postals/2023-d.avif"),
	},
	"2024": {
		front: require("../../../assets/resources/postals/2024-c.avif"),
		back: require("../../../assets/resources/postals/2024-d.avif"),
	},
	"2025": {
		front: require("../../../assets/resources/postals/2025-c.avif"),
		back: require("../../../assets/resources/postals/2025-d.avif"),
	},
	"2025-casament": {
		front: require("../../../assets/resources/postals/2025-casament-c.avif"),
		back: require("../../../assets/resources/postals/2025-casament-d.avif"),
	},
};
