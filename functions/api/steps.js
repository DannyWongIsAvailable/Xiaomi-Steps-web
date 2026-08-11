const APP_NAME = 'com.xiaomi.hm.health'
const USER_AGENT = 'MiFit/6.12.0 (MCE16; Android 16; Density/1.5)'
const DEVICE_ID = '0000000000000000'

const FORM_HEADERS = {
  'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'user-agent': USER_AGENT,
  app_name: APP_NAME,
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'cache-control': 'no-store',
    },
  })
}

function normalizeAccount(account) {
  const value = String(account ?? '').trim()
  if (/^1\d{10}$/.test(value)) {
    return { account: `+86${value}`, thirdName: 'huami_phone' }
  }
  return { account: value, thirdName: 'huami' }
}

function localDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function getTimestamp() {
  return Math.floor(Date.now() / 1000)
}

async function readJsonSafe(response) {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

async function login(account, password) {
  const normalized = normalizeAccount(account)
  const firstBody = new URLSearchParams({
    client_id: 'HuaMi',
    country_code: 'CN',
    json_response: 'true',
    name: normalized.account,
    password,
    redirect_uri: 'https://s3-us-west-2.amazonaws.com/hm-registration/successsignin.html',
    state: 'REDIRECTION',
    token: 'access',
  })

  const firstResponse = await fetch(
    `https://api-user.huami.com/registrations/${encodeURIComponent(normalized.account)}/tokens`,
    {
      method: 'POST',
      headers: FORM_HEADERS,
      body: firstBody.toString(),
    },
  )

  const firstData = await readJsonSafe(firstResponse)

  if (firstResponse.status === 429) {
    throw new Error('请求过于频繁，请稍后再试。')
  }
  if (!firstResponse.ok) {
    throw new Error(`Zepp Life 登录失败（HTTP ${firstResponse.status}）。`)
  }
  if (!firstData?.access) {
    throw new Error('Zepp Life 账号或密码不正确。')
  }

  const secondBody = new URLSearchParams({
    app_name: APP_NAME,
    country_code: 'CN',
    code: firstData.access,
    device_id: '00:00:00:00:00:00',
    device_model: 'android_phone',
    app_version: '6.12.0',
    grant_type: 'access_token',
    allow_registration: 'false',
    source: APP_NAME,
    third_name: normalized.thirdName,
  })

  const secondResponse = await fetch('https://account.huami.com/v2/client/login', {
    method: 'POST',
    headers: FORM_HEADERS,
    body: secondBody.toString(),
  })

  const secondData = await readJsonSafe(secondResponse)
  if (!secondResponse.ok) {
    throw new Error(`获取登录 Token 失败（HTTP ${secondResponse.status}）。`)
  }

  const loginToken = secondData?.token_info?.login_token
  const userId = secondData?.token_info?.user_id
  if (!loginToken || !userId) {
    throw new Error('登录成功，但未获取到 login_token 或 user_id。')
  }

  return { loginToken, userId }
}

async function getAppToken(loginToken) {
  const response = await fetch(
    `https://account-cn.huami.com/v1/client/app_tokens?login_token=${encodeURIComponent(loginToken)}`,
    { headers: FORM_HEADERS },
  )

  const data = await readJsonSafe(response)
  if (!response.ok) {
    throw new Error(`获取 app_token 失败（HTTP ${response.status}）。`)
  }

  const appToken = data?.token_info?.app_token
  if (!appToken) {
    throw new Error('未获取到 app_token。')
  }
  return appToken
}

function buildDataJson(steps, dateToday) {
  return (
    '%5b%7b%22data_hr%22%3a%22' +
    '%5c%2fv7%2b'.repeat(480) +
    `%22%2c%22date%22%3a%22${dateToday}%22%2c%22data%22%3a%5b%7b%22start%22%3a0%2c%22stop%22%3a1439%2c%22value%22%3a%22` +
    'A'.repeat(5760) +
    `%22%2c%22tz%22%3a32%2c%22did%22%3a%22${DEVICE_ID}%22%2c%22src%22%3a24%7d%5d%2c%22summary%22%3a%22%7b%5c%22v%5c%22%3a6%2c%5c%22slp%5c%22%3a%7b%5c%22st%5c%22%3a0%2c%5c%22ed%5c%22%3a0%2c%5c%22dp%5c%22%3a0%2c%5c%22lt%5c%22%3a0%2c%5c%22wk%5c%22%3a0%2c%5c%22usrSt%5c%22%3a-1440%2c%5c%22usrEd%5c%22%3a-1440%2c%5c%22wc%5c%22%3a0%2c%5c%22is%5c%22%3a0%2c%5c%22lb%5c%22%3a0%2c%5c%22to%5c%22%3a0%2c%5c%22dt%5c%22%3a0%2c%5c%22rhr%5c%22%3a0%2c%5c%22ss%5c%22%3a0%7d%2c%5c%22stp%5c%22%3a%7b%5c%22ttl%5c%22%3a${steps}%2c%5c%22dis%5c%22%3a0%2c%5c%22cal%5c%22%3a0%2c%5c%22wk%5c%22%3a0%2c%5c%22rn%5c%22%3a0%2c%5c%22runDist%5c%22%3a0%2c%5c%22runCal%5c%22%3a0%2c%5c%22stage%5c%22%3a%5b%5d%7d%2c%5c%22goal%5c%22%3a0%2c%5c%22tz%5c%22%3a%5c%2228800%5c%22%7d%22%2c%22source%22%3a24%2c%22type%22%3a0%7d%5d`
  )
}

async function changeSteps(userId, appToken, steps) {
  const timestamp = getTimestamp()
  const dateToday = localDateString()
  const dataJson = buildDataJson(steps, dateToday)

  const body =
    `userid=${encodeURIComponent(userId)}` +
    `&last_sync_data_time=${timestamp}` +
    '&device_type=0' +
    `&last_deviceid=${DEVICE_ID}` +
    `&data_json=${dataJson}`

  const response = await fetch(
    `https://api-mifit-cn.huami.com/v1/data/band_data.json?&t=${timestamp}`,
    {
      method: 'POST',
      headers: {
        ...FORM_HEADERS,
        apptoken: appToken,
      },
      body,
    },
  )

  const data = await readJsonSafe(response)
  if (!response.ok) {
    throw new Error(`提交步数失败（HTTP ${response.status}）。`)
  }
  if (data?.message !== 'success') {
    throw new Error(`步数修改失败：${data?.message || 'Huami API 未返回 success。'}`)
  }

  return { success: true, steps, userId, date: dateToday }
}

export async function onRequestPost(context) {
  try {
    const contentType = context.request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return json({ success: false, message: '请求格式错误。' }, 415)
    }

    const payload = await context.request.json()
    const account = String(payload?.account ?? '').trim()
    const password = String(payload?.password ?? '')
    const steps = Number.parseInt(payload?.steps, 10)

    if (!account) return json({ success: false, message: '请输入 Zepp Life 账号。' }, 400)
    if (!password) return json({ success: false, message: '请输入 Zepp Life 密码。' }, 400)
    if (!Number.isInteger(steps) || steps <= 0) {
      return json({ success: false, message: '请输入有效的目标步数。' }, 400)
    }

    const { loginToken, userId } = await login(account, password)
    const appToken = await getAppToken(loginToken)
    const result = await changeSteps(userId, appToken, steps)
    return json(result)
  } catch (error) {
    console.error('steps function error:', error)
    return json(
      {
        success: false,
        message: error instanceof Error ? error.message : '请求失败，请稍后重试。',
      },
      502,
    )
  }
}

export function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context)
  return json({ success: false, message: 'Method Not Allowed' }, 405)
}
