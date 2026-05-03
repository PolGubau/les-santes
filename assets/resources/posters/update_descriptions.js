const fs = require('fs');
const path = './assets/resources/posters/posters.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const descriptions = {
  2026: "Joe Dart ret homenatge a Joan Hortós, autor del cartell de Les Santes 2011 i amic seu. Al cartell hi apareix una noia amb la capa del Ball de Diables de Mataró, una de les comparses protagonistes de l'Encesa. Hortós va dissenyar el vestuari que la colla va estrenar fa dos anys.",
  2023: "Carla Aledo va plantejar el cartell com un joc. A partir de la combinació de mides i colors de cercles, s'hi poden cercar i trobar cadascuna de les figures i comparses de la Festa Major, reconeixibles pels seus colors característics. El cartell reflecteix el formigueig dels carrers, plens de gent acompanyant les comparses, amb les figures de Juliana i Semproniana en posició central. Les lletres de 'Les Santes' estan escrites a mà per l'autora.",
  2021: "Marta Floriach va crear una pintura centrada en dues figures zoomòrfiques. Podrien ser en Robafaves i la Geganta: ell amb un cos que recorda la Momerota, ella amb un cos d'au que evocaria l'àliga. Estan en una actitud còmplice, en un entorn festiu, celebrant la festa, brindant, potser ballant o a punt de fer-se un petó. El cartell, creat el 2020, es va estrenar el 2021 perquè la pandèmia va cancel·lar la festa l'any anterior.",
  2020: "Marta Floriach va crear el cartell de Les Santes 2020, que no es va arribar a exhibir degut a la cancel·lació de la festa per la pandèmia de la Covid-19. El disseny incorporava figures zoomòrfiques evocadores dels personatges festius de Mataró, i va ser finalment reutilitzat com a cartell de 2021 en la represa de la festa.",
  2019: "Jaume Simon va crear un cartell amb formes geomètriques i colors primaris centrat en la figura del castell de focs, element icònic de la nit de Les Santes. A més, va retre un homenatge al cartell de Jordi Cuyàs de 1995 incloent-hi les copes característiques d'aquell disseny.",
  2015: "Albert Alís va presentar la figura del Drac en moviment envoltat de foc i gent, en un esclat de groc, vermell i taronja. Volia representar l'aspecte més dionisíacament festiu de la Festa Major. El grafisme del títol i del 2015 aporten moviment a la imatge, significant el constant anar i venir de gent animada durant la festa.",
  2009: "Mònica Vilert va voler plasmar dos conceptes que per a ella defineixen Les Santes de Mataró: un fragment de la capa de la Geganta i el moviment que transmet quan la figura balla i giravolta. Per a ella, Les Santes són sinònim de moviment continu: gent amunt i avall, successió d'actes, balls... La ciutat, a l'igual que els seus gegants, es mou.",
  2003: "J.M. Calleja va crear un cartell amb rellotges i grans zones de color gris, on destaca el text 'Les Santes' i la data del 27 de juliol. Un disseny que generà debat i no deixà ningú indiferent.",
  2025: "El cartell de Les Santes 2025 parteix d'una adaptació d'una pintura a l'oli sobre fusta d'Ana García Pérez. A diferència del 2024, on el cartell venia d'un mural real al barri de Rocafonda, el d'aquest any és una obra pictòrica.",
  2024: "Mohamed L'Ghacham va plasmar el seu disseny en una paret del barri de Rocafonda, pintat en deu dies però ideat arran d'un procés participatiu de dos mesos. El cartell mostra dos joves conversant amb una dona gran l'endemà de la Nit Boja.",
  2022: "La il·lustradora i tatuadora Sit Cantallops va presentar un cartell titllat de transgressor, amb un fort segell personal i un missatge implícit. Juliana i Semproniana apareixen al centre, amb un aspecte juvenil i actual, gaudint de la festa en llibertat. De fons, la ciutat dibuixada.",
  2018: "Jordi Prat va crear el perfil d'en Robafaves amb la cara indefinida, una imatge que va donar peu a molts muntatges i variacions per part de la ciutadania.",
  2017: "Raül Roncero va distribuir elements independents representatius de Les Santes: una campana, unes ulleres per fer la Travessa nedant al Port, una espardenya i el ventall de la Missa de Les Santes. Hi va incloure fins i tot una samarreta de Martí Anson del 2008.",
  2016: "Laia Arnau va posar les Diablesses en primer pla, protagonistes indiscutibles d'un cartell que ret homenatge a una de les comparses més emblemàtiques de la Festa Major de Mataró.",
  2014: "Regina Puig va crear tot un ecosistema de personatges actualitzats, fent circular en Robafaves i la Geganta en bici i omplint-lo d'onomatopeies pròpies dels dies de festa. Un cartell en tons blancs i sèpia que contrastava amb el rosa d'una xapa que es va convertir en clauer aquell estiu.",
  2013: "L'escultor Pol Codina va donar relleu escultòric al seu cartell, protagonitzat per les figures de la Festa Major. Un disseny tridimensional que destacava les formes per sobre dels colors.",
  2012: "L'arquitecte Agàpit Borràs va vincular el disseny amb el patrimoni arquitectònic de la ciutat i hi va afegir elements de collage, com l'espart per fer els cabells de les santes patrones.",
  2011: "Joan Hortós va aportar un toc oníric al cartell amb una trampa de colors al centre i talls de síndria flotant per un paisatge cent per cent mataroní, en referència a la popular Xindriada.",
  2010: "Dani Montlleó va representar com es capgira la ciutat els dies de la festa amb un cartell escrit al revés. De la inversió de 'Santes' apareixia el personatge d'en Setnas, que fins i tot es va reproduir en forma de nino de foam.",
  2008: "Martí Anson va sorprendre amb un dels cartells que més samarretes ha escampat pels carrers de la ciutat. Mataró es va convertir en un gran club groc-i-negre. Més que un cartell, Anson va crear directament una samarreta.",
  2007: "Marc Prat va col·locar en primer pla la mà d'en Robafaves i va utilitzar una de les seves tècniques preferides, el dibuix en carbó.",
  2006: "L'artista visual Ita Puig es va decantar per l'abstracció per representar la festa com a punt de trobada entre els mataronins.",
  2005: "Xavier Rosales va marcar un abans i un després en l'estètica del cartell. Per primera vegada era iconogràfic: una reproducció d'un senyal d'inflamable dins un rombe vermell, sobre un fons blanc. Malgrat l'acusació de plagi, va obrir nous camins estilístics.",
  1981: "Néfer va crear un cartell retallable amb figures col·leccionables: el Robafaves, la Geganta i uns Enanos inventats per ella mateixa. Va ser un èxit tan gran que es va fer una segona edició amb paper més gruixut. La gent va criticar que la palma del Robafaves era molt pansida, però ningú es va queixar dels grenots inventats.",
  1992: "Primer 'cartell d'artista' de l'etapa moderna, seguint el model del cartell de les Festes de la Mercè de Barcelona. Perecoll va plasmar el seu estil de l'època —molt d'aquarel·la en un traçat creuat i particular— amb la mà d'en Robafaves com a element central. Va establir el format del cartell d'autor que definiria les dècades posteriors i va ser el punt de partida del 'quartet d'or' (1992–1995).",
  1993: "Cartell que va desfermar la passió col·leccionista a la ciutat. Part del 'quartet d'or' (1992–1995), Parés de Mataró va crear l'obra pictòrica que el crític Pere Pascual 'PIC' considera el gran catalitzador de l'interès popular pel cartell de Les Santes: inclou les figures i comparses de la festa amb una qualitat excepcional i va iniciar el debat artístic anual al voltant de la imatge de la Festa Major.",
  1994: "Part del 'quartet d'or' (1992–1995), anys en què s'assolí el màxim nivell d'excel·lència artística en els cartells de Les Santes. Santiago Estrany aportà la seva visió pictòrica personal a la imatge de la festa, contribuint a una època que el crític Pere Pascual 'PIC' descriu com d'altíssima qualitat.",
  1995: "Tanca el 'quartet d'or' (1992–1995), considerat per la crítica el cim de l'etapa moderna dels cartells de Les Santes. El crític Pere Pascual 'PIC' el situa entre els millors de tota l'etapa moderna per la manera de generar el cartell en concepte aplicat amb llenguatge plàstic. Destacat per les seves copes característiques, va marcar el nivell d'excel·lència d'aquella dècada daurada.",
  1996: "Primer cartell posterior al 'quartet d'or', Marta Duran inaugurà la continuïtat d'excel·lència que va caracteritzar la festa fins al 2004. Obra pictòrica que aportà la sensibilitat i estil propi de l'autora a la representació de les figures festives de la Festa Major.",
  1997: "Considerat pel crític Pere Pascual 'PIC' un dels millors cartells de tota l'etapa moderna de Les Santes, al costat del de Jordi Cuyàs (1995). Antoni Lleonart va saber despullar la idea de la festa i generar una imatge amb un alt nivell de concepte plàstic, defugint de l'anècdota iconogràfica i captant l'esperit de la festa.",
  1998: "Cartell d'autor de l'artista local Domènec, inscrit en el cicle de qualitat artística que va caracteritzar la dècada dels noranta. Forma part de la sèrie d'artistes mataronins consagrats que van mantenir el nivell d'excel·lència posterior al 'quartet d'or'.",
  1999: "Obra de Carme Garolera que forma part de la col·lecció d'artistes locals consagrats que van participar en el programa de cartell d'autor entre 1992 i 2004. La seva aportació segueix la línia de qualitat pictòrica que va definir aquell període daurat de la imatge de la Festa Major.",
  2000: "Pintura d'autora local que forma part de la col·lecció d'imatges de la festa democràtica. Rosa Codina-Esteve va aportar la seva visió personal a la representació de Les Santes, inscrivint-se en el grup d'artistes mataronins que van fer del cartell un referent artístic de la ciutat.",
  2001: "Proposta d'estil personal vinculada a la trajectòria artística de Pere Màrtir Viada. S'inscriu en el grup d'artistes mataronins consagrats que van crear el cartell de Les Santes en l'etapa d'excel·lència artística de finals dels noranta i primers anys dos mil.",
  2002: "Obra d'un artista consagrat de l'àmbit local, inscrita en la línia de cartell d'autor que havia definit la festa des de 1992. Josep M. Codina va aportar la seva visió artística personal en un dels darrers anys d'aquella etapa daurada.",
  2004: "Darrera obra de la dècada d'homenatge als artistes locals, abans del canvi estètic de 2005 quan Xavier Rosales va trencar amb la tradició del cartell d'autor mataroní. Iago Vilamanyà tanca un cicle de dotze anys en què artistes locals consagrats van fer del cartell de Les Santes un referent artístic a la ciutat."
};

let updated = 0;
data.forEach(entry => {
  if (descriptions[entry.year] && !entry.description) {
    entry.description = descriptions[entry.year];
    updated++;
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, '\t'), 'utf8');
console.log('Updated:', updated, 'entries');
const noDesc = data.filter(e => !e.description);
console.log('Remaining without description:', noDesc.length);
noDesc.forEach(e => console.log(' -', e.year, '|', e.author || 'no author'));
