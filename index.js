const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const port = 3000;

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

app.post('/upload', async function (req, res) {
  const filename = req.header('MatchZy-FileName');
  const matchId = req.header('MatchZy-MatchId');
  const key = `${matchId}/${filename}`;

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', async () => {
    try {
      const body = Buffer.concat(chunks);
      await s3.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: body,
      }));
      res.status(200).end('Success');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).end('Error uploading demo file: ' + message);
    }
  });
  req.on('error', (err) => {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).end('Error reading request: ' + message);
  });
});

app.listen(port);