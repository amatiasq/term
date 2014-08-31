import Stream from './tools/simple-stream';
import HtmlRenderer from './tools/html-renderer';
import output from './output-logic';
import input from './input-logic';

var renderer = new HtmlRenderer();

var $log = document.querySelector('#log');
renderer.fromAnsiStream($log, output);

var $box = document.querySelector('#box');
document.addEventListener('click', event => $box.focus());

output.on('data', scrollBottom);
function scrollBottom() {
	setTimeout(_=> document.body.scrollTop = document.body.scrollHeight, 0);
}
