import axios from 'axios'

export async function modifySteps(account, password, steps, onProgress) {
  const parsedSteps = Number.parseInt(steps, 10)

  if (!account?.trim()) throw new Error('请输入 Zepp Life 账号。')
  if (!password) throw new Error('请输入 Zepp Life 密码。')
  if (!Number.isInteger(parsedSteps) || parsedSteps <= 0) {
    throw new Error('请输入有效的目标步数。')
  }

  onProgress?.('submit', '正在通过 Cloudflare Function 登录并提交步数…')

  try {
    const response = await axios.post(
      '/api/steps',
      {
        account: account.trim(),
        password,
        steps: parsedSteps,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      },
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || '步数修改失败。')
    }

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiMessage = error.response?.data?.message
      if (apiMessage) throw new Error(apiMessage)
      if (!error.response) {
        throw new Error(
          '无法访问 /api/steps。若你正在使用 pnpm dev，本地 Vite 不会运行 Cloudflare Pages Functions；请部署到 Cloudflare Pages 后测试。',
        )
      }
      throw new Error(`请求失败（HTTP ${error.response.status}）。`)
    }
    throw error
  }
}
