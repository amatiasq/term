import './Controls.css';

import { render } from '../render';
import html from './Controls.html';

type Observable = (listener: (data: number) => void) => void;

export class Controls {
  private readonly dom = render(html);
  private readonly meterTpl = this.dom.$('.meter-template')!;
  private readonly buttonTpl = this.dom.$('.button-template')!;

  render(parent: HTMLElement) {
    parent.appendChild(this.dom);
  }

  addMeter(color: string, observable: Observable) {
    const fragment = render(this.meterTpl, {
      '.meter': x => {
        x.style.setProperty('--color', color);
        x.style.setProperty('--value', '100%');

        observable(value => {
          const percent = Math.round(value * 100);
          x.style.setProperty('--value', `${percent}%`);
        });
      },
    });

    this.dom.appendChild(fragment);
  }

  addButton(name: string, onClick: () => void) {
    const fragment = render(this.buttonTpl, {
      button: x => {
        x.textContent = name;
        x.addEventListener('click', onClick);
      },
    });

    this.dom.appendChild(fragment);
  }
}
