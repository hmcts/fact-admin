import {launchBrowser} from '../support/hooks';

const scope = require('../support/scope');

export const newPage = async () => {
  scope.page = await scope.browser.newPage();
  await scope.page.setDefaultNavigationTimeout(100000);
};

export const reloadPage = async () => {
  await scope.page.reload();
};

export const newBrowser = async () => {
  await scope.browser.close();
  await launchBrowser();
};

export const goTo = async (url: string) => {
  await scope.page.goto(url, { timeout: 90000, waitUntil: 'load' });
};

export const getPageTitle = async () => {
  return await scope.page.title();
};

export const hover = async (selector: string) => {
  await scope.page.hover(selector);
};

export const click = async (selector: string) => {
  await scope.page.$eval(selector, (elem: HTMLElement) => elem.click());
};

export const setInputField = async (selector: string, value: string) => {
  // Programatically set the value of the field, rather than typing
  await scope.page.evaluate((selector: string, value: string) => {
    (document.querySelector(selector) as HTMLInputElement).value = value;
  }, selector, value);
};

export const fillField = async (selector: string, value: string) => {
  await scope.page.type(selector, value);
};

export const checkElement = async (selector: string) => {
  try {
    await scope.page.mouse.move(1000, 40);
    await scope.page.waitForSelector(selector);
    return true;
  } catch (error) {
    return false;
  }
};

export const uploadFile = async (selector: string, path: string) => {
  try {
    await scope.page.mouse.move(1000, 40);
    const [fileChooser] = await Promise.all([
      scope.page.waitForFileChooser(),
      scope.page.click(selector)
    ]);
    await fileChooser.accept([path]);
  } catch (error) {
    console.log(`uploadFile for Selector(${selector}) failed with: ${error}`);
  }
};

export const getElement = async (selector: string) => {
  try {
    await scope.page.waitForSelector(selector);
    return await scope.page.$(selector);
  } catch (error) {
    return null;
  }
};

export const getElements = async (selector: string) => {
  try {
    await scope.page.waitForSelector(selector);
    return await scope.page.$$(selector);
  } catch (error) {
    return null;
  }
};

export const getTextFromSelector = async (el: string) => {
  try {
    return await scope.page.$$eval(el, (elements: any) => elements.map((e: any) => e.value));
  } catch (error) {
    return [];
  }
};

export const getHtmlFromElements = async (el: string) => {
  try {
    return await scope.page.$$eval(el, (elements: any) => elements.map((e: any) => e.innerHTML));
  } catch (error) {
    return [];
  }
};

export const getElementText = async (el: any) => {
  try {
    return await scope.page.evaluate((element: HTMLElement) => element.innerText.trim(), el);
  } catch (error) {
    return false;
  }
};

export const checkElementIsAnchor = async (el: any) => {
  try {
    const tagName = await scope.page.evaluate((element: HTMLElement) => element.tagName, el);
    return tagName === 'A';
  } catch (error) {
    return false;
  }
};

export const checkElementLength = async (selector: string) => {
  try {
    await scope.page.waitForSelector(selector);
    const el = await scope.page.$$(selector);
    return el.length;
  } catch (error) {
    return false;
  }
};

export const getTextFromList = async (selector: string) => {
  try {
    const texts = await scope.page.evaluate((s: string) => Array.from(document.querySelectorAll(s),
      (element: Element) => element.innerHTML.toString()), selector);
    return texts;
  } catch (error) {
    return [];
  }
};

export const fillFieldInIframe = async (selector: string, value: string) => {
  try {
    const iframeSelector = `${selector}_ifr`;
    await scope.page.waitForSelector(iframeSelector);
    const elementHandle = await scope.page.$(iframeSelector);
    const frame = await elementHandle.contentFrame();

    await frame.$eval('#tinymce > p', (el: HTMLElement, value: string) => el.innerText = value, value);
  } catch (error) {
    console.log(`fillFieldInIframe for Selector(${selector}) failed with: ${error}`);
  }
};

export const getIframeContent = async (selector: string) => {
  try {
    await scope.page.waitForSelector(selector);
    const elementHandle = await scope.page.$(selector);
    const frame = await elementHandle.contentFrame();
    return await frame.$eval('#tinymce > p', (element: HTMLElement) => element.innerText.trim());
  } catch (error) {
    return null;
  }
};

export const clearField = async (selector: string) => {
  try {
    const input = await scope.page.$(selector);
    await input.click({clickCount: 3});
    await scope.page.keyboard.press('Backspace');
  } catch (error) {
    console.log(`clearField for Selector(${selector}) failed with: ${error}`);
  }
};

export const selectItem = async (selector: string, value: string) => {
  try {
    await scope.page.select(selector, value);
  } catch (error) {
    console.log(`selectItem for Selector(${selector}) failed with: ${error}`);
  }
};

export const countElement = async (selector: string): Promise<number> => {
  try {
    const count = (await scope.page.$$(selector)).length;
    return count;
  } catch (error) {
    console.log(`countElement for Selector(${selector}) failed with: ${error}`);
  }
};

export const clickElementAtIndex = async (selector: string, index: number) => {
  try {
    return await scope.page.evaluate(
      (entrySelector: string, index: number) =>
        (document.querySelectorAll(entrySelector)[index] as HTMLButtonElement).click(), selector, index
    );
  } catch (error) {
    console.log(`clickElementAtIndex for Selector(${selector}) failed with: ${error}`);
  }
};

export const getLastElementValue = async (selector: string) => {
  try {
    const input = await scope.page.$$(selector);
    const lastIdx = input.length - 1;
    const value = await scope.page.evaluate((x: any) => x.value, input[lastIdx]);
    return value;
  } catch (error) {
    console.log(`getLastElementValue for Selector(${selector}) failed with: ${error}`);
  }
};

/**
 * Returns the selectedIndex of an HTML Select element
 * @param selector The selector for an array of HTML Select elements
 * @param index The index of the HTML Select element to return
 */
export const getSelectedIndexAtIndex = async (selector: string, index: number) => {
  try {
    const input = await scope.page.$$(selector);
    return await scope.page.evaluate((x: HTMLSelectElement) => x.selectedIndex, input[index]);
  } catch (error) {
    console.log(`getSelectedIndexAtIndex for Selector(${selector}) failed with: ${error}`);
  }
};

/**
 * Returns the value of an HTML Select or Input element
 * @param selector The selector for an array of HTML Select and Input elements
 * @param index The index of the element to return
 */
export const getElementValueAtIndex = async (selector: string, index: number) => {
  try {
    const input = await scope.page.$$(selector);
    return await scope.page.evaluate((x: HTMLSelectElement | HTMLInputElement) => x.value, input[index]);
  } catch (error) {
    console.log(`getElementValueAtIndex for Selector(${selector}) failed with: ${error}`);
  }
};

/**
 * Sets the value of an HTML Select or Input element. For Select elements, the selectedIndex will be set to the given value.
 * @param selector The selector for an array of HTML Select / Input elements
 * @param index The index of the element to set
 * @param value The value to set
 * @param type The expected type of the element
 */
export const setElementValueAtIndex = async (selector: string, index: number, value: number | string, type: ('select' | 'input') = 'input') => {
  try {
    const input = await scope.page.$$(selector);
    return await scope.page.evaluate((el: HTMLSelectElement | HTMLInputElement, type: ('select' | 'input'), value: string) =>
      (type === 'select' ? (el as HTMLSelectElement).selectedIndex = parseInt(value) : el.value = value), input[index], type, value);
  } catch (error) {
    console.log(`setElementValueAtIndex for Selector(${selector}) failed with: ${error}`);
  }
};

export const setElementValueForInputField = async (selector: string, value: string) => {
  try {
    await scope.page.$eval(selector, (el: HTMLInputElement, value: string) => el.value = value, value);
  } catch (error) {
    console.log(`setElementValueForInputField for selector(${selector}) failed with: ${error}`);
  }
};

export const isElementVisible = async (selector: string, timeout: number) => {
  let visible = true;
  await scope.page.waitForSelector(selector, {visible: true, timeout: timeout})
    .catch(() => {
      visible = false;
    });
  return visible;
};

export const isElementChecked = async (selector: string) => {
  try {
    return await scope.page.$eval(selector, (checkbox: any) => checkbox.checked);
  } catch (error) {
    console.log(`isElementChecked for Selector(${selector}) failed with: ${error}`);
  }
};

/**
 * Returns the index (zero-based) of the first table row that contains the given text at the given table column number or -1 if not found.
 * @param tableContainerSelector The container for the table
 * @param tableColumnNumber The column number in which to look for the text. The first column is 1, second is 2 etc.
 * @param text The search text.
 */
export const getFirstTableRowIndexContainingText = async (tableContainerSelector: string, tableColumnNumber: number, text: string) => {
  const columnData: string[] = await scope.page.$$eval(`${tableContainerSelector} table tr td:nth-child(${tableColumnNumber}`,
    (tds: HTMLTableDataCellElement[]) => tds.map((td) => td.innerText));
  return columnData.indexOf(text);
};

export const getTextFromElements = async (el: string) => {
  try {
    return await scope.page.$$eval(el, (elements: any) => elements.map((e: any) => e.innerText));
  } catch (error) {
    return [];
  }
};

export const getValueFromElements = async (el: string) => {
  try {
    return await scope.page.$$eval(el, (elements: any) => elements.map((e: any) => e.valueOf()));
  } catch (error) {
    return [];
  }
};
