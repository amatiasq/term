import './Sidebar.css';

import { render } from '../render';
import html from './Sidebar.html';

export class Sidebar {
  private readonly dom = render(html);

  render(parent: HTMLElement) {
    parent.appendChild(this.dom);
  }
}
