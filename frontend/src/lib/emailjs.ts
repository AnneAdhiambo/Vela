import emailjs from '@emailjs/browser'

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_b3yn4ot'
const EMAILJS_TEMPLATE_WAITLIST = 'template_zlaheo4'
const EMAILJS_TEMPLATE_NEWSLETTER = 'template_newsletter_welcome'
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

// Initialize EmailJS
export const initEmailJS = () => {
  if (!EMAILJS_PUBLIC_KEY) {
    console.warn('⚠️ EmailJS public key not found. Email functionality will be disabled.')
    return false
  }
  
  emailjs.init(EMAILJS_PUBLIC_KEY)
  return true
}

// Send waitlist confirmation email
export const sendWaitlistConfirmation = async (name: string, email: string): Promise<boolean> => {
  try {
    if (!EMAILJS_PUBLIC_KEY) {
      console.warn('⚠️ EmailJS not configured, skipping email send')
      return false
    }

    const templateParams = {
      name: name,
      email: email,
      from_name: 'Vela Team',
      reply_to: 'noreply@vela-app.com'
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_WAITLIST,
      templateParams
    )

    return true
  } catch (error) {
    console.error('❌ Error sending waitlist confirmation email:', error)
    return false
  }
}

// Send newsletter welcome email
export const sendNewsletterWelcome = async (email: string): Promise<boolean> => {
  try {
    if (!EMAILJS_PUBLIC_KEY) {
      console.warn('⚠️ EmailJS not configured, skipping email send')
      return false
    }

    const templateParams = {
      email: email,
      from_name: 'Vela Team',
      reply_to: 'noreply@vela-app.com'
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_NEWSLETTER,
      templateParams
    )

    return true
  } catch (error) {
    console.error('❌ Error sending newsletter welcome email:', error)
    return false
  }
}

// Send launch notification email
export const sendLaunchNotification = async (name: string, email: string): Promise<boolean> => {
  try {
    if (!EMAILJS_PUBLIC_KEY) {
      console.warn('⚠️ EmailJS not configured, skipping email send')
      return false
    }

    const templateParams = {
      name: name,
      email: email,
      from_name: 'Vela Team',
      reply_to: 'noreply@vela-app.com'
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      'template_launch_notification', // We'll create this template
      templateParams
    )

    return true
  } catch (error) {
    console.error('❌ Error sending launch notification email:', error)
    return false
  }
}

export default emailjs
