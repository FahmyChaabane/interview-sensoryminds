import twilio  from 'twilio';

// phone number
const YOUR_TWILIO_PHONE_NUMBER = process.env.YOUR_TWILIO_PHONE_NUMBER!;
// acount sid 
const YOUR_TWILIO_ACCOUNT_SID = process.env.YOUR_TWILIO_ACCOUNT_SID!;
// secret
const YOUR_TWILIO_AUTH_TOKEN = process.env.YOUR_TWILIO_AUTH_TOKEN!;
// destination number
const DESTINATION_NUMBER = process.env.DESTINATION_NUMBER!;

export const notifyUserWithText = async () => {  
// Trigger Twilio notification
const twilioClient = twilio(YOUR_TWILIO_ACCOUNT_SID, YOUR_TWILIO_AUTH_TOKEN);
await twilioClient.messages.create({
  body: 'Web Content Monitor has detected a change!',
  from: YOUR_TWILIO_PHONE_NUMBER,
  to: DESTINATION_NUMBER,
})}