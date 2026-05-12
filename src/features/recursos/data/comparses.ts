/* eslint-disable @typescript-eslint/no-require-imports */

export interface ComparsaEntry {
  id: string;
  name: string;
  emoji: string;
  type: string;
  since: string;
  shortDesc: string;
  fullDesc: string;
  music: string;
  portadors: string;
  facts: string[];
  image: number;
  isFire: boolean;
}

export const COMPARSA_ASSETS: Record<string, number> = {
  'robafaves': require('../../../../assets/media/comparses/familia-robafabes.avif'),
  'aliga': require('../../../../assets/media/comparses/aliga.avif'),
  'momerota': require('../../../../assets/media/comparses/momerota.avif'),
  'drac': require('../../../../assets/media/comparses/drac.avif'),
  'diablesses': require('../../../../assets/media/comparses/diablesses.avif'),
};

export const COMPARSES: ComparsaEntry[] = [
  {
    id: 'robafaves',
    name: 'La Família Robafaves',
    emoji: '👑',
    type: 'Gegants i Nans',
    since: 'Des del s. XVII',
    shortDesc: 'Els gegants institucionals de Mataró: quatre figures i divuit nans.',
    fullDesc: `La Família Robafaves és el cor de la festa. Formada per en Robafaves i la Geganta, la seva filla Toneta i el marit d'aquesta, en Maneló, és la comparsa que millor representa l'ànima mataronina.

En Robafaves té la seva pròpia llegenda: el nom prové d'un personatge picaresc de la tradició popular que robava faves als pagesos. La seva presència als seguicis festius de la ciutat està documentada des del segle XVII.

Els divuit Nans que sempre els precedeixen —el Bufó, el Pagès, la Bruixa, el Follet, l'Arlequí, el Xinès, el Comte, el Moro, en Patufet i d'altres— contrastaven amb la solemnitat dels gegants amb els seus balls ràpids i traviesos. Sempre disposen a fer ensurts als nens del públic.

El 1984, el ple de l'Ajuntament va aprovar el Reglament dels Gegants, que fixa que els portadors han de ser voluntaris —abans era un ofici remunerat— i que vetlla per la dignitat de les figures i l'estima que generen entre mataronins i visitants.`,
    music: 'Flabiolaires',
    portadors: '7 adults per figura (28 en total) · 45 portadors de Nans',
    facts: [
      'Quatre balls propis: de Grossos, de Petits, de Quatre i de Nans',
      '18 Nans amb nom propi, des del Bufó fins a en Biada',
      'Els portadors són 100% voluntaris des del Reglament de 1984',
      "Surten molt poc durant l'any: les Santes és el seu gran moment",
    ],
    image: COMPARSA_ASSETS['robafaves'],
    isFire: false,
  },
  {
    id: 'aliga',
    name: "L'Àliga",
    emoji: '🦅',
    type: 'Figura protocol·lària',
    since: 'S. XVII · recuperada el 1987',
    shortDesc: 'La figura més solemne. Representa la ciutat en els actes institucionals.',
    fullDesc: `L'Àliga és la comparsa més majestuosa i solemne del seguici festiu de Mataró. Duu, com la majoria d'àligues catalanes, una corona al cap i un colom a la boca —símbol de pau i poder.

La seva presència a les processons mataronines es documenta des del segle XVII, però va ser recuperada el 1987 després d'anys d'absència. Als seguicis sempre precedeix les autoritats: és l'entremès protocol·lari per excel·lència.

A diferència de les altres figures, l'Àliga és portada per una sola persona. El que la fa única és la cobla de ministrils que l'acompanya: músics que toquen instruments antics com tarotes, flabiols, violins, sac de gemecs i tabals, emulant les antigues cobles dels segles XVII i XVIII.

Si la veus ballar, para i observa en silenci: els seus moviments lents i precisos, combinats amb la música arcaica, transporten a un altre temps.`,
    music: 'Cobla de ministrils: tarota, tarota tenor, tiple, fiscorns i tabal',
    portadors: '1 sola persona',
    facts: [
      'Precedeix sempre les autoritats als seguicis: és el protocol de la festa',
      'La música de ministrils imita les cobles del s. XVII-XVIII',
      'Corona al cap i colom a la boca: símbols de poder i pau',
      "Una de les poques figures que treu a ballar a l'aire lliure amb cobla pròpia",
    ],
    image: COMPARSA_ASSETS['aliga'],
    isFire: false,
  },
  {
    id: 'momerota',
    name: 'La Momerota i la Momeroteta',
    emoji: '🔥',
    type: 'Figures de foc',
    since: '1979 · Momeroteta: 1982',
    shortDesc: 'Mare i filla amb cap de bou i cos de mulassa. La primera figura recuperada el 1979.',
    fullDesc: `La Momerota va ser la primera figura de foc recuperada a Mataró, l'any 1979, com a part de la refundació de la festa major. Té un ball propi alegre i vistós que s'acompanya amb gralla i tabal, i en ella es pot llegir tota la irreverència i la llibertat del moviment que va donar vida a Les Santes modernes.

Figura de foc amb cap de bou i cos de mulassa, la Momerota és portada per dues persones que la fan córrer, saltar i ballar de manera desenfrenada. Als seus dos punts de foc a les banyes cremen carretilles i titanis que ruixen de guspires tot el que té a prop.

La Momeroteta, la filla, va néixer el 1982. Més petita i amb la llengua treta, té el mateix caràcter entremaliat i transgressor. Funciona de manera independent però sempre en sintonia amb la seva mare.

Tant la Momerota com la Momeroteta surt per Carnestoltes i per Les Santes, i participen en festes de barris i invitacions a d'altres ciutats. Si les veus apropar-se, prepara't per rebre guspires.`,
    music: 'Gralla i tabal',
    portadors: '2 persones per figura',
    facts: [
      'Primera figura de foc recuperada a Mataró (1979)',
      'Pirotècnia: carretilles i titanis a les banyes',
      'La Momeroteta (1982) és la seva filla, amb la llengua treta',
      "Protagonista principal de l'Escapada a Negra Nit (correfoc del 25 de juliol)",
    ],
    image: COMPARSA_ASSETS['momerota'],
    isFire: true,
  },
  {
    id: 'drac',
    name: 'El Drac i el Dragalió',
    emoji: '🐉',
    type: 'Figures de foc',
    since: '1991 · Dragalió: 2007',
    shortDesc: "Inspirat en el drac del casc d'en Robafaves. Surt de nit i comparteix el foc amb el públic.",
    fullDesc: `El Drac de Mataró va néixer el 1991, inspirat directament en el drac alat que figura esculpit al casc d'en Robafaves. A diferència d'altres dracs de Catalunya, és portat per una sola persona, la qual cosa el fa molt àgil i permet que es mogui entre el públic de ben a prop.

La pirotècnia que llueix —ales, cua i boca— és especialment amable: permet que la gent balli i l'acompanyi sense por. Pren un protagonisme especial per la Fogonada de Sant Jordi, en què s'adapta la llegenda del sant amb una lluita teatralitzada.

Per Sant Jordi de 2007, el Drac va "enviar un ou" al públic. El dia de la Crida de la Festa Major d'aquell any en nasqué el Dragalió, el seu fill. Igual que el seu pare, el Dragalió és portat per una sola persona, és una figura juvenil i juganer, i treu foc per ales, cua i boca.

Les dues figures participen juntes a Les Santes, les festes de barris i els correfocs als quals son convidats.`,
    music: 'Tabalers del Drac',
    portadors: '1 sola persona per figura',
    facts: [
      "Inspirat en el drac esculpit al casc d'en Robafaves",
      "Protagonista de la Fogonada de Sant Jordi, cada 23 d'abril",
      "El Dragalió va \"néixer\" d'un ou enviat a la festa el 2007",
      "Foc per ales, cua i boca — la pirotècnia més amable del bestiari",
    ],
    image: COMPARSA_ASSETS['drac'],
    isFire: true,
  },
  {
    id: 'diablesses',
    name: 'Les Diablesses',
    emoji: '😈',
    type: 'Colla de foc femenina',
    since: '1985',
    shortDesc: "Una de les poques colles de foc totalment femenines de Catalunya.",
    fullDesc: `Les Diablesses van néixer el 1985 i des del primer moment han estat una de les colles de foc íntegrament femenines més reconegudes de Catalunya. La seva presència als correfocs i cercaviles és inconfusible: vermell i negre, foc i nit.

Cada membre de la colla porta una massa de la qual brota foc, sota la qual conviden el públic a passar de ben a prop —una experiència intensa que qui la viu no oblida. A més, la colla té una forca que encenen en moments de lluïment especial.

La seva indumentària és única al seguici: incorpora diversos motius dibuixats i cosits a mà, basats en dissenys originals de l'artista mataronina Nefer, relacionats amb els conceptes del foc i la nit.

La música que les acompanya és interpretada pels Tabalers Do Maresme, una colla de tabals que marca el ritme de les seves corredisses i balls. La combinació de so percussiu, foc i moviment femení crea una de les atmosferes més especials de la festa.`,
    music: 'Tabalers Do Maresme',
    portadors: 'Colla femenina · nombre variable',
    facts: [
      "Una de les poques colles de foc totalment femenines de Catalunya",
      "Indumentària amb dissenys originals de l'artista mataronina Nefer",
      "La forca encesa és el seu moment de màxim lluïment",
      "Conviden el públic a passar sota el foc de les masses",
    ],
    image: COMPARSA_ASSETS['diablesses'],
    isFire: true,
  },
];
