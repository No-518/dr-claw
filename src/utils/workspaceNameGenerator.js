const WORD_LIST = [
  'amber',
  'aurora',
  'breeze',
  'bronze',
  'canyon',
  'cascade',
  'cedar',
  'cinder',
  'clover',
  'comet',
  'coral',
  'cosmos',
  'crystal',
  'dawn',
  'drift',
  'echo',
  'eclipse',
  'ember',
  'fern',
  'frost',
  'galaxy',
  'glacier',
  'grove',
  'harbor',
  'horizon',
  'indigo',
  'iris',
  'island',
  'jade',
  'juniper',
  'lagoon',
  'lotus',
  'marble',
  'meadow',
  'mist',
  'moonbeam',
  'nebula',
  'nova',
  'oasis',
  'obsidian',
  'orchid',
  'pearl',
  'pine',
  'quartz',
  'rainfall',
  'reef',
  'river',
  'saffron',
  'sandstone',
  'solstice',
  'spruce',
  'starlight',
  'summit',
  'sunrise',
  'tempest',
  'thicket',
  'tidal',
  'valley',
  'violet',
  'waterfall',
  'willow',
  'zenith',
  'zephyr'
];

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}${minutes}`;
};

const pickRandomWord = () => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

export const generateWorkspaceName = () => {
  const now = new Date();
  return `${pickRandomWord()}-${formatDate(now)}`;
};

export const generateWorkspaceNameWithTime = () => {
  const now = new Date();
  return `${pickRandomWord()}-${formatDate(now)}-${formatTime(now)}`;
};

export default generateWorkspaceName;
