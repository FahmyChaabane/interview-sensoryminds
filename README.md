# interview-sensoryminds

- The .env file looks something like this : 
```
SPREADSHEETID= // google sheet id
SHEETNAME= // google sheet name

YOUR_TWILIO_PHONE_NUMBER= // source number from twilio
YOUR_TWILIO_ACCOUNT_SID= // account sid from twilio
YOUR_TWILIO_AUTH_TOKEN= // auth token from twilio
DESTINATION_NUMBER= // number to be notified

CRON_EXPERESSION=* * * * * // cron job run every minute
```

- The application could be divided into **microservices**:
  1. Main Service the launches the cron job.
  ==> When a change is detected, the main service publish events to 2 queues. (pub/sub kind of queue, AWS SNS for example)
      - First queue publishes the writing data to service 2.
      - Second queue publishes notification data to service 3.
  2. service 2 that is responsible for pushing data to google sheet is subscribed to the first queue.
  3. service 3 that is responsible for sending sms notification is subscribed to the second queue.
 ---

Added **credentials.json** and **token.json** to .gitignore because of security reasons.
Followed [this guide](https://developers.google.com/sheets/api/quickstart/nodejs) to set them up.

 ---

Used simple Redis docker image by running : $ docker run -d --name redis -p 6379:6379 redis

---
