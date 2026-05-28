import axe from 'axe-core';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const defaultRunOptions: axe.RunOptions = {
  runOnly: { type: 'tag', values: WCAG_TAGS },
};

export async function runAxe(element: Element, options?: axe.RunOptions): Promise<axe.AxeResults> {
  return axe.run(element, {
    ...defaultRunOptions,
    ...options,
    runOnly: options?.runOnly ?? defaultRunOptions.runOnly,
  });
}
