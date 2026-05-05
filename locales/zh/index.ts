import common from './common'
import chat from './chat'
import profile from './profile'
import literature from './literature'
import workshop from './workshop'
import favorites from './favorites'
import admin from './admin'

const zh = {
  ...common,
  ...chat,
  ...profile,
  ...literature,
  ...workshop,
  ...favorites,
  ...admin,
} as const

export default zh
