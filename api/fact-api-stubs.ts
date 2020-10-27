import express, { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
const app = express();

const data = require('./courts.json');
const port = 8080;

app.use(bodyParser.json());

app.get('/courts/all', (req: Request, res: Response) => {
  res.json(data);
});

app.listen(port, () => {
  console.log(`Application started: http://localhost:${port}`);
});
