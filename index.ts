import puppeteer, { Page, Browser } from 'puppeteer';
import { notifyUserWithText } from './notification';
import { authorize, writeDataToGoogleSheet } from './googleSheet';
import { launchRedisClient } from './redis';
import { SheetColumns } from './SheetColumns';
import cron from 'node-cron';
import 'dotenv/config'

const writeData = async (sheetColumns: SheetColumns) => {
  const client = await authorize();
  try {
    await writeDataToGoogleSheet(client, sheetColumns)
  } catch(error) {
    console.error(error);
  }
}

const trackWebsiteChanges = async (page: Page) => {

  const startTime = Date.now();

  const httpResponse = await page.goto('https://www.example.com/');

  const endTime = Date.now();

  const duration = endTime - startTime;

  console.log('Request duration:', duration, 'ms');

  const httpStatus = httpResponse?.status()!;
  console.log('Request StatusCode:', httpStatus);

  // Get the initial version of the webpage
  const pageContent = await page.content();

  const redisClient = await launchRedisClient()

  // Compare with the previous version from Redis
  const previousPageContent: string | null = await redisClient.get('website_content');

  if (pageContent !== previousPageContent) {
    // Update Redis with the new content
    await redisClient.set('website_content', pageContent);

    // Write Data to GoogleSheet
    await writeData({pageContent, httpStatus, duration})

    // notify SMS
    await notifyUserWithText()
  }

  // Close Redis Session
  await redisClient.quit()
}

(async () => {
  // Schedule your function to run every minute
  cron.schedule(process.env.CRON_EXPERESSION!, async () => {
    console.log('Start Cron Job');
    const browser: Browser = await puppeteer.launch({headless: "new"});
    const page: Page = await browser.newPage();
    await trackWebsiteChanges(page);
    await browser.close()
  });
})();
