import { Observable } from 'rx';
import { fromAnsi as render } from './tools/html-renderer';
import output from './output-logic';
import input from './input-logic';

function scrollBottom() {
  setTimeout(_=> document.body.scrollTop = document.body.scrollHeight, 0);
}

var $box = document.querySelector('#box');

Observable.fromEvent(document, 'click')
  .subscribe(event => $box.focus());

render(document.querySelector('#log'), output);
output.subscribe(scrollBottom);
