import './Hamburger.css';

import { emitter } from '@amatiasq/emitter';

import { render } from '../render';
import html from './Hamburger.html';

export class Hamburger {
  private readonly dom = render(html);
  private readonly checkbox = this.dom.$<HTMLInputElement>('input');

  private readonly emitChange = emitter<boolean>();
  readonly onChange = this.emitChange.subscribe;

  constructor(initialState = false) {
    this.toggle = this.toggle.bind(this);
    this.checkbox.checked = initialState;
  }

  render(parent: HTMLElement) {
    this.checkbox.addEventListener('change', this.toggle);

    parent.appendChild(this.dom);

    if (this.checkbox.checked) {
      this.toggle();
    }
  }

  toggle() {
    this.emitChange(this.checkbox.checked);
  }
}
