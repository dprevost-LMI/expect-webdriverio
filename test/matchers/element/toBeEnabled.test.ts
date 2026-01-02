import { vi, describe, beforeEach, test, expect } from 'vitest'
import { toBeEnabled } from '../../../src/matchers/element/toBeEnabled.js'

const beforeAssertion = vi.fn()
const afterAssertion = vi.fn()

const elementFactory = (elementId: string) => {
    const element = {
        elementId,
        isEnabled: vi.fn().mockResolvedValue(true) as () => Promise<boolean>,
    } satisfies Partial<WebdriverIO.Element> as WebdriverIO.Element
    element.getElement = vi.fn()
    return element
}

const browserA = { getElement: vi.fn().mockResolvedValue(elementFactory('elementIdA1')) } as unknown as WebdriverIO.Browser
const browserB = { getElement: vi.fn().mockResolvedValue(elementFactory('elementIdB1')) } as unknown as WebdriverIO.Browser

type MultiRemoteType = WebdriverIO.MultiRemoteElement & { browserA: WebdriverIO.Element; browserB: WebdriverIO.Element } & { getElement: () => Promise<WebdriverIO.Element[]> }

const multiRemoteBrowserInstances: Record<string, WebdriverIO.Browser> = {
    'browserA':  browserA,
    'browserB':  browserB,
}

vi.mock('@wdio/globals', () => ({
    browser: {
        getElement: vi.fn(),
    },
    multiremotebrowser: {
        isMultiremote: true,
        instances: ['browserA'],
        getInstance: (name: string) => {
            const instance = multiRemoteBrowserInstances[name]
            if (!instance) {
                throw new Error(`No such instance: ${name}`)
            }
            return instance
        },
        getElement: vi.fn(),
    }
}))

describe('toBeEnabled', () => {
    describe('given isNot false', () => {
        const defaultContext = { isNot: false, toBeEnabled }

        beforeEach(() => {
            beforeAssertion.mockClear()
            afterAssertion.mockClear()
        })

        describe('Single Element', () => {
            let element: WebdriverIO.Element

            beforeEach(() => {
                element = elementFactory('elementId1')
                element.getElement = vi.fn().mockResolvedValue(element)
            })

            test('when success', async () => {
                const result = await defaultContext.toBeEnabled(element)

                expect(result.pass).toBe(true)
            })

            test('when failure', async () => {
                element.isEnabled = vi.fn().mockResolvedValue(false) as () => Promise<boolean>

                const result = await defaultContext.toBeEnabled(element)

                expect(result.pass).toBe(false)
                expect(result.message()).toContain('Expect <fn> to be enabled')
                expect(result.message()).toContain('Expected: "enabled"')
                expect(result.message()).toContain('Received: "not enabled"')
            })

            describe('given before/after assertion hooks and options', () => {
                const options = {
                    beforeAssertion,
                    afterAssertion,
                }

                test('when success', async () => {
                    const result = await defaultContext.toBeEnabled(element, options)

                    expect(result.pass).toBe(true)
                    expect(beforeAssertion).toBeCalledWith({
                        matcherName: 'toBeEnabled',
                        options,
                    })
                    expect(afterAssertion).toBeCalledWith({
                        matcherName: 'toBeEnabled',
                        options,
                        result,
                    })
                })
            })
        })

        describe('MultiRemote Element', () => {
            let element: WebdriverIO.MultiRemoteElement
            let elementA: WebdriverIO.Element
            let elementB: WebdriverIO.Element

            beforeEach(() => {
                elementA = elementFactory('elementIdA1')
                elementB = elementFactory('elementIdB1')
                element = {
                    isMultiremote: true,
                    instances: ['browserA', 'browserB'],
                    getElement: vi.fn().mockResolvedValue([elementA, elementB]) as () => Promise<WebdriverIO.Element[]>,
                    browserA: elementA,
                    browserB: elementB,
                    getInstance: (name: string) => name === 'browserA' ? elementA : elementB
                } satisfies Partial<MultiRemoteType> as MultiRemoteType
            })

            test('when success', async () => {
                const result = await defaultContext.toBeEnabled(element)

                expect(result.pass).toBe(true)
            })

            test('when failure for one element', async () => {
                elementA.isEnabled = vi.fn().mockResolvedValue(false) as () => Promise<boolean>

                const result = await defaultContext.toBeEnabled(element)

                expect(result.pass).toBe(false)
                expect(result.message()).toContain('Expect <fn> to be enabled for remote "browserA"')
                expect(result.message()).toContain('Expected: "enabled"')
                expect(result.message()).toContain('Received: "not enabled"')
            })

            test('when failure for multiple elements', async () => {
                elementA.isEnabled = vi.fn().mockResolvedValue(false) as () => Promise<boolean>
                elementB.isEnabled = vi.fn().mockResolvedValue(false) as () => Promise<boolean>

                const result = await defaultContext.toBeEnabled(element)

                expect(result.pass).toBe(false)
                expect(result.message()).toContain('Expect <fn> to be enabled for remote "browserA"')
                expect(result.message()).toContain('Expect <fn> to be enabled for remote "browserB"')
            })
        })
    })

    describe('given isNot true', () => {
        const defaultContext = { isNot: true, toBeEnabled }

        beforeEach(() => {
            beforeAssertion.mockClear()
            afterAssertion.mockClear()
        })

        describe('Single Element', () => {
            let element: WebdriverIO.Element

            beforeEach(() => {
                element = {
                    isEnabled: vi.fn().mockResolvedValue(false) as () => Promise<boolean>
                } satisfies Partial<WebdriverIO.Element> as WebdriverIO.Element
            })

            test('when success', async () => {
                const result = await defaultContext.toBeEnabled(element)

                expect(result.pass).toBe(true)
            })

            test('when failure', async () => {
                element.isEnabled = vi.fn().mockResolvedValue(true) as () => Promise<boolean>

                const result = await defaultContext.toBeEnabled(element)

                expect(result.pass).toBe(false)
                expect(result.message()).toContain('Expect <fn> not to be enabled')
                expect(result.message()).toContain('Expected [not]: "enabled"')
                expect(result.message()).toContain('Received      : "enabled"')
            })
        })

        describe('MultiRemote Element', () => {
            let element: WebdriverIO.MultiRemoteElement
            let elementA: WebdriverIO.Element
            let elementB: WebdriverIO.Element

            beforeEach(() => {
                elementA = { isEnabled: vi.fn().mockResolvedValue(false) as () => Promise<boolean> } satisfies Partial<WebdriverIO.Element> as WebdriverIO.Element
                elementB = { isEnabled: vi.fn().mockResolvedValue(false) as () => Promise<boolean> } satisfies Partial<WebdriverIO.Element> as WebdriverIO.Element
                element = {
                    isMultiremote: true,
                    instances: ['browserA', 'browserB'],
                    getInstance: (name: string) => name === 'browserA' ? elementA : elementB
                } satisfies Partial<WebdriverIO.MultiRemoteElement> as WebdriverIO.MultiRemoteElement
            })

            test('when success', async () => {
                const result = await defaultContext.toBeEnabled(element)

                expect(result.pass).toBe(true)
            })

            test('when failure for one element', async () => {
                elementA.isEnabled = vi.fn().mockResolvedValue(true) as () => Promise<boolean>

                const result = await defaultContext.toBeEnabled(element)

                expect(result.pass).toBe(false)
                expect(result.message()).toContain('Expect <fn> not to be enabled for remote "browserA"')
            })
        })
    })
})
