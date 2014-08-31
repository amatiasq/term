var BACKSPACE = '\x08';

var escapes = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  '\'': '&#039;',
};

function escapeHtml(character) {
  return escapes.hasOwnProperty(character) ?
    escapes[character] :
    character;
}

export default class HtmlRenderer {

  fromAnsiStream(dom, stream) {
    var styles = {};
    var div = document.createElement('div');
    var span = document.createElement('span');

    div.appendChild(span);
    dom.appendChild(div);

    stream.on('data', data => {
      if (data === '\n') {
        div = document.createElement('div');
        dom.appendChild(div);
        data = styles;
      }

      if (typeof data !== 'string') {
        span = document.createElement('span');
        span.className = this.stylesToClasses(data).join(' ');
        div.appendChild(span);
        styles = data;
        return;
      }

      if (data === BACKSPACE)
        return span.innerHTML = span.innerHTML.slice(0, -1);

      span.innerHTML += escapeHtml(data);
    });
  }

  fromLinesStream(dom, stream) {
    stream.on('data', line => {
      var div = document.createElement('div');
      dom.appendChild(div);

      line.on('data', block => {
        var span = document.createElement('span');
        div.appendChild(span);

        block.on('data', data => {
          if (typeof data === 'string')
            span.innerHTML += escapeHtml(data);
          else
            span.className = this.stylesToClasses(data).join(' ');
        });
      });
    });
  }

  stylesToClasses(styles) {
    return Object.keys(styles)
      .map(key => {
        var value = styles[key];
        var appendix = value === true ? '' : '-' + value;
        return 'ansi-' + key + appendix;
      });
      //.filter(Boolean);
  }
}
