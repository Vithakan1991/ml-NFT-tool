import { KEY_STORE } from 'common/constants'

export default class StorageActions {
  static setLocale(payload) {
    return {
      type: KEY_STORE.SET_LOCALE,
      payload,
    }
  }
}
