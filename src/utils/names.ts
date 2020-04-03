const forenames = [
  'agnes',
  'al',
  'alice',
  'alli',
  'amelia',
  'ankha',
  'angus',
  'apollo',
  'apple',
  'astrid',
  'audie',
  'aurora',
  'ava',
  'avery',
  'axel',
  'bam',
  'bangle',
  'barold',
  'bea',
  'beardo',
  'becky',
  'bella',
  'bertha',
  'bianca',
  'biff',
  'bill',
  'billy',
  'biskit',
  'bitty',
  'blaire',
  'bob',
  'bonbon',
  'bones',
  'boomer',
  'boone',
  'boots',
  'boris',
  'boyd',
  'bree',
  'bruce',
  'buck',
  'bud',
  'bunnie',
  'butch',
  'buzz',
  'cally',
  'candi',
  'carmen',
  'carrie',
  'celia',
  'cesar',
  'chai',
  'cheri',
  'cherry',
  'chevre',
  'chief',
  'chops',
  'chow',
  'claude',
  'clay',
  'cleo',
  'clyde',
  'coach',
  'cobb',
  'coco',
  'cole',
  'colton',
  'cookie',
  'croque',
  'cube',
  'curlos',
  'curly',
  'curt',
  'cyd',
  'cyrano',
  'daisy',
  'deena',
  'del',
  'deli',
  'derwin',
  'diana',
  'diva',
  'dizzy',
  'dobie',
  'doc',
  'dom',
  'dora',
  'dotty',
  'drago',
  'drake',
  'drift',
  'ed',
  'egbert',
  'elise',
  'ellie',
  'elmer',
  'eloise',
  'elvis',
  'erik',
  'eunice',
  'eugene',
  'fang',
  'fauna',
  'flip',
  'flo',
  'flora',
  'flurry',
  'frank',
  'freya',
  'friga',
  'frita',
  'gabi',
  'gala',
  'gaston',
  'gayle',
  'genji',
  'gigi',
  'gladys',
  'gloria',
  'goldie',
  'gonzo',
  'goose',
  'graham',
  'greta',
  'gruff',
  'gwen',
  'hamlet',
  'hans',
  'harry',
  'hazel',
  'henry',
  'hopper',
  'huck',
  'hugh',
  'iggly',
  'ike',
  'jacob',
  'jakey',
  'jay',
  'joey',
  'judy',
  'julia',
  'julian',
  'june',
  'kabuki',
  'katt',
  'keaton',
  'ken',
  'kevin',
  'kidd',
  'kiki',
  'kitt',
  'kitty',
  'klaus',
  'knox',
  'kody',
  'kyle',
  'lily',
  'lionel',
  'lobo',
  'lolly',
  'lopez',
  'lucha',
  'lucky',
  'lucy',
  'lyman',
  'mac',
  'maddie',
  'maelle',
  'maggie',
  'maple',
  'margie',
  'marcel',
  'marcie',
  'marina',
  'megan',
  'melba',
  'merry',
  'midge',
  'mint',
  'mira',
  'mitzi',
  'moe',
  'molly',
  'monty',
  'moose',
  'mott',
  'muffy',
  'murphy',
  'nan',
  'nana',
  'naomi',
  'nate',
  'norma',
  'olaf',
  'olive',
  'olivia',
  'opal',
  'ozzie',
  'pango',
  'papi',
  'paolo',
  'pate',
  'patty',
  'paula',
  'peanut',
  'pecan',
  'peck',
  'peewee',
  'peggy',
  'pekoe',
  'phil',
  'phoebe',
  'pierce',
  'pietro',
  'pinky',
  'piper',
  'pippy',
  'plucky',
  'pompom',
  'poncho',
  'poppy',
  'portia',
  'prince',
  'puck',
  'pudge',
  'punchy',
  'purrl',
  'raddle',
  'rasher',
  'rex',
  'rhonda',
  'ribbot',
  'ricky',
  'rizzo',
  'roald',
  'robin',
  'rocco',
  'rocket',
  'rod',
  'rodeo',
  'rodney',
  'rolf',
  'rooney',
  'rory',
  'roscoe',
  'rosie',
  'rowan',
  'ruby',
  'rudy',
  'sally',
  'samson',
  'sandy',
  'scoot',
  'shari',
  'shep',
  'sherb',
  'simon',
  'skye',
  'sly',
  'snake',
  'snooty',
  'soleil',
  'sparro',
  'spike',
  'spork',
  'static',
  'stella',
  'stinky',
  'stu',
  'sydney',
  'sylvia',
  'tabby',
  'tad',
  'tammi',
  'tammy',
  'tangy',
  'tank',
  'tasha',
  'teddy',
  'tex',
  'tia',
  'timbra',
  'tipper',
  'tom',
  'tucker',
  'tutu',
  'twiggy',
  'tybalt',
  'ursala',
  'velma',
  'vesta',
  'vic',
  'violet',
  'vivian',
  'wade',
  'walker',
  'walt',
  'weber',
  'wendy',
  'winnie',
  'willow',
  'yuka',
  'zell',
  'zucker',
];
const initials = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Number of unique names should be 20,321,912
// Calculated like so:
// const vowelVariants = forenames
//   .map(name => {
//     const match = name.match(/[aeiou]/gi);
//     return match === null ? 0 : match.length;
//   })
//   .map(vowels => Math.pow(6, vowels))
//   .reduce((a, b) => a + b);

// const limit = vowelVariants * initials.length * initials.length;

const usedNames = [];
const nameGenerator = () => {
  let forename = forenames[Math.floor(Math.random() * forenames.length)];
  forename = forename.replace(/[aeiou]/, () => 'aeiouy'.split('')[Math.floor(Math.random() * 6)]);
  forename = forename.charAt(0).toUpperCase() + forename.slice(1).toLowerCase();
  const initial1 = initials[Math.floor(Math.random() * initials.length)];
  const initial2 = initials[Math.floor(Math.random() * initials.length)];
  const name = `${forename} ${initial1}${initial2}`;
  if (usedNames.includes(name)) {
    return nameGenerator();
  } else {
    usedNames.push(name);
    return name;
  }
};

export default nameGenerator;
