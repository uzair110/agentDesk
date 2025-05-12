import axios from "axios"

interface SlackResponse {
  status: 'success' | 'error'
  message: string
  text: string
}

export async function postToSlack(
  webhookUrl: string,
  text: string
): Promise<string> {
  try {
    const payload = { text }
    const res = await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
    })

    const response: SlackResponse = res.status === 200
      ? {
          status: 'success',
          text: payload.text,
          message: 'Your message has been sent to Slack!'
        }
      : {
          status: 'error',
          text: payload.text,
          message: `Slack webhook failed: ${res.status} ${res.statusText}`
        }

    return JSON.stringify(response)
  } catch (err: any) {
    console.error('Error sending Slack notification:', err.message)
    throw err
  }
}