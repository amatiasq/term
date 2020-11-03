import './Controls.css';

import { renderHtml } from '../util/renderHtml';
import html from './Controls.html';

type Observable = (listener: (data: number) => void) => void;

export class Controls {
  private readonly $fragment = renderHtml(html);
  private readonly $el = this.$fragment.firstElementChild!;
  private readonly createMeter = template(this.$fragment, '.meter-template');
  private readonly createButton = template(this.$fragment, '.button-template');

  render(parent: HTMLElement) {
    parent.appendChild(this.$el);
  }

  addMeter(color: string, observable: Observable) {
    const fragment = this.createMeter();

    const meter = fragment.querySelector('.meter') as HTMLElement;
    meter.style.setProperty('--color', color);
    meter.style.setProperty('--value', '100%');

    this.$el.appendChild(fragment);

    observable(value => {
      const percent = Math.round(value * 100);
      meter.style.setProperty('--value', `${percent}%`);
    });
  }

  addButton(name: string, onClick: () => void) {
    const fragment = this.createButton();
    const button = fragment.firstElementChild as HTMLElement;
    button.textContent = name;
    button.addEventListener('click', onClick);
    this.$el.appendChild(fragment);
  }
}

function template<T extends HTMLElement = HTMLElement>(
  el: HTMLElement | DocumentFragment,
  selector: string,
) {
  const tpl = el.querySelector(selector) as HTMLTemplateElement;
  return () => tpl.content.cloneNode(true) as T;
}
