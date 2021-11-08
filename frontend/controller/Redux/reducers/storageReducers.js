import createReducer from '../lib/reducerConfig'
import { KEY_STORE } from 'common/constants'
import initState from '../lib/initState'

const localeEN = {
  lang: 'en',
}

export const locale = createReducer(localeEN, {
  [KEY_STORE.SET_LOCALE](state, action) {
    switch (action.payload) {
      case 'en':
        return localeEN
      default:
        return localeEN
    }
  },
})
