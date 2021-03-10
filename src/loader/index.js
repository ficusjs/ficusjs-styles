window.__ficusjs__ = window.__ficusjs__ || {}
window.__ficusjs__.styles = window.__ficusjs__.styles || {}

const componentTagName = 'ficusjs-styles'

function processStyle (item) {
  // if this is an http(s)://**/*.css url, create link element and inject into header
  const linkRegex = /http[s]?:\/\/.+\.css$/
  if (linkRegex.test(item)) {
    const linkElem = document.createElement('link')
    linkElem.rel = 'stylesheet'
    linkElem.type = 'text/css'
    linkElem.href = item
    document.head.appendChild(linkElem)
    return
  }

  // if this is a local file, read it and return the contents
  const fileRegex = /.+\.css$/
  if (fileRegex.test(item)) {
    return window.fetch(item).then(css => css.text())
  }

  // otherwise this is (hopefully) raw css so return it
  return item
}

function createAndInjectStylesheet (cssText, attributes) {
  const style = createStyle(cssText)
  setElementAttributes(style, attributes)
  document.head.appendChild(style)
  window.__ficusjs__.styles[componentTagName] = { loaded: true, style }
}

function createStyle (cssText) {
  const style = document.createElement('style')
  style.appendChild(document.createTextNode(cssText))
  return style
}

function setElementAttributes (element, attributes) {
  if (attributes) {
    Object.keys(attributes).forEach(k => {
      element.setAttribute(k, attributes[k])
    })
  }
}

export function loadStyles (styleItems = []) {
  if (typeof window !== 'undefined') {
    if (window.__ficusjs__ && window.__ficusjs__.styles && window.__ficusjs__.styles[componentTagName]) return

    if ((Array.isArray(styleItems) && styleItems.filter(x => typeof x !== 'string').length) || (!Array.isArray(styleItems) && typeof styleItems !== 'string')) {
      // if this IS an array and any of the elements are NOT a string -> Error
      // if this is NOT an array and also NOT a string -> Error
      console.error('Dude, styles must return a string or an array of strings!')
      return
    }

    let cssToImport = ''
    // styles may be an array
    if (Array.isArray(styleItems)) {
      Promise.all(styleItems.map(item => processStyle(item)))
        .then(allCss => {
          cssToImport = allCss.filter(css => css).join('\n')
          createAndInjectStylesheet(cssToImport, { 'data-tag': componentTagName })
        })
    } else {
      processStyle(styleItems)
        .then(cssToImport => createAndInjectStylesheet(cssToImport, { 'data-tag': componentTagName }))
    }
  }
}
