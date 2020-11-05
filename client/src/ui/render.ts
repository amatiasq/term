export function render(
  template: string | HTMLElement,
  config?: Record<string, (el: HTMLElement) => void>,
) {
  if (typeof template === 'string') {
    template = renderHtml(template);
  }

  const instance =
    template instanceof HTMLTemplateElement
      ? clone(template.content)
      : clone(template);

  if (config) {
    for (const [selector, operator] of Object.entries(config)) {
      const el = instance.querySelector(selector) as HTMLElement;

      if (el) {
        operator(el);
      } else {
        console.error(`Selector ${selector} returned no results`);
      }
    }
  }

  return Object.assign(instance, {
    $: <T extends HTMLElement>(selector: string) =>
      instance.querySelector(selector) as T,
  });
}

function renderHtml(html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template;
}

function clone<T extends Node>(el: T) {
  return el.cloneNode(true) as T;
}
