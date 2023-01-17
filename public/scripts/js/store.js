class Store {
  /**
   * @type {Storage}
   */
  #store;
  /**
   * @type {JSON.parse}
   */
  #p;
  /**
   * @type {JSON.stringify}
   */
  #s;

  constructor() {
    this.#store = localStorage;
    this.#p = JSON.parse;
    this.#s = JSON.stringify;
  }

  /**
   *
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    const item = {
      value: value,
    };

    // if atleast one dot is present in the key then check for sub keys
    if (key.includes(".")) {
      const keys = key.split(".");
      const lastKey = keys.pop();

      let subItem = this.#p(this.#store.getItem(keys[0]));

      if (subItem === null) {
        subItem = {};
      }

      let subSubItem = subItem;

      for (let i = 1; i < keys.length; i++) {
        if (subSubItem[keys[i]] === undefined) {
          subSubItem[keys[i]] = {};
        }

        subSubItem = subSubItem[keys[i]];
      }

      subSubItem[lastKey] = value;

      item.value = subItem;
    }

    this.#store.setItem(key, this.#s(item));
  }

  /**
   *
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    /**
     * @type {{value: any}}
     */
    const item = this.#p(this.#store.getItem(key));

    if (item && item.value) {
      return item.value;
    }

    return undefined;
  }
}
