/**
 * Ensures that the specified condition passes for a given element or every element in an array of elements
 * @param element The element or array of elements or multi-remote element[]
 * @param condition - The condition function to be executed on the element(s).
 * @param options - Optional configuration options
 * @param params - Additional parameters
 */
export async function executeCommand(
    element: WebdriverIO.Element | WebdriverIO.ElementArray,
    condition: (element: WebdriverIO.Element | WebdriverIO.ElementArray, ...params: unknown[]) => Promise<{
        result: boolean;
        value?: unknown;
    }>,
    options: ExpectWebdriverIO.DefaultOptions = {},
    params: unknown[] = []
): Promise<{ el: WebdriverIO.Element | WebdriverIO.ElementArray; success: boolean; values: unknown; }> {
    const result = await condition(element, ...params, options)
    return {
        el: element,
        success: result.result === true,
        values: result.value
    }
}
