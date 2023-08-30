
import { authenticate } from '@google-cloud/local-auth';
import { promises } from 'fs';
import { google } from 'googleapis';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth';
import { OAuth2Client } from 'google-auth-library';
import { SheetColumns } from './SheetColumns';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const loadSavedCredentialsIfExist = async () => {
  try {
    const content = (await promises.readFile(TOKEN_PATH)).toLocaleString();
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

const saveCredentials = async (client: OAuth2Client) => {
  const content = (await promises.readFile(CREDENTIALS_PATH)).toString();
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await promises.writeFile(TOKEN_PATH, payload);
}

export const authorize = async () => {
  let client: JSONClient | null | OAuth2Client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

export const writeDataToGoogleSheet = async (auth: any, sheetColumns: SheetColumns) => {
  const sheets = google.sheets({version: 'v4', auth});
  
  let values = [
    [Date(), sheetColumns.pageContent, `Status Code: ${sheetColumns.httpStatus}`, `Request Duration: ${sheetColumns.duration} ms`]
    // Potential next row
  ];
  const spreadsheetId = process.env.SPREADSHEETID!;
  const sheetName = process.env.SHEETNAME!;
  
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!A1`, // Start writing from cell A1
      valueInputOption: 'RAW',
      requestBody: {
        values: values
      } // Write the content in a 2D array
    });
    console.log('Content written to Google Sheet:', response.data);
  } catch (error) {
    console.error('Error writing to Google Sheet:', error);
  }
}