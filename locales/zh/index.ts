import common from './common'
import chat from './chat'
import profile from './profile'
import literature from './literature'
import workshop from './workshop'
import favorites from './favorites'

const zh = {
  ...common,
  ...chat,
  ...profile,
  ...literature,
  ...workshop,
  ...favorites,
} as const

export default zh
