import './Sidebar.css';

import { renderHtml } from '../util/renderHtml';
import html from './Sidebar.html';

export class Sidebar {
  private readonly $fragment = renderHtml(html);
  private readonly $el = this.$fragment.firstElementChild as HTMLElement;

  render(parent: HTMLElement) {
    parent.appendChild(this.$el);
  }
}
