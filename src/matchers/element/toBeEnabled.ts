import { executeMultiRemoteCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, WdioMultiRemoteElementMaybePromise } from '../../types.js'

export async function toBeEnabled(
    this: ExpectWebdriverIO.MatcherContext,
    received: WdioElementMaybePromise | WdioMultiRemoteElementMaybePromise,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
): Promise<ExpectWebdriverIO.AssertionResult> {
    this.expectation = this.expectation || 'enabled'

    await options.beforeAssertion?.({
        matcherName: 'toBeEnabled',
        options,
    })

    const result = await executeMultiRemoteCommandBe.call(this, received, element => element?.isEnabled(), options)

    await options.afterAssertion?.({
        matcherName: 'toBeEnabled',
        options,
        result
    })

    return result
}
