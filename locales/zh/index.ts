import common from './common';
import chat from './chat';
import profile from './profile';
import literature from './literature';
import workshop from './workshop';

const zh = {
  ...common,
  ...chat,
  ...profile,
  ...literature,
  ...workshop,
} as const;

export default zh;
