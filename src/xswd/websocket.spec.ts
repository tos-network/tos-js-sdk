import { to } from 'await-to-js'

import { LOCAL_XSWD_WS } from '../config'
import XSWD, { XSWDAppConfig } from '../xswd/websocket'

const RUN_XSWD_WS_TESTS = process.env.RUN_TOS_XSWD_WS_TESTS === 'true'
const describeXSWD = RUN_XSWD_WS_TESTS ? describe : describe.skip

describeXSWD('XSWD_WS', () => {
  test(`connect`, async () => {
    const xswd = new XSWD()
    const [err] = await to(xswd.connect(LOCAL_XSWD_WS))
    expect(err).toBeNull()

    const app: XSWDAppConfig = {
      name: "Test App",
      description: "This is a test app.",
      permissions: ["get_address", "get_balance"]
    }

    const [err2, res2] = await to(xswd.authorize(app))
    expect(err2).toBeNull()

    console.log(res2)
    expect(res2)

    const [err3, res3] = await to(xswd.wallet.getAddress())
    expect(err3).toBeNull()

    console.log(res3)
    expect(res3)

    const [err4, res4] = await to(xswd.daemon.getInfo())
    expect(err4).toBeNull()

    console.log(res4)
    expect(res4)


    xswd.close()
  }, 10000)
})
