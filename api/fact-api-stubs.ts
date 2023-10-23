import express, { Request, Response } from 'express';
const app = express();

const data = require('./courts.json');
const courtDetails = require('./court-details.json');
const port = 8080;
const baseURL = '/courts';

app.use(express.urlencoded({extended: true}));

app.get(`${baseURL}/all`, (req: Request, res: Response) => {
  res.json(data);
});

app.get(`${baseURL}/:slug`, (req: Request, res: Response) => {
  const slug: string = (req.params.slug as string).toLowerCase();
  const courts = [...courtDetails];
  const court = courts.find(court => court.slug.toLowerCase() === slug);
  res.json(court);
});

app.put(`${baseURL}/:slug`, (req: Request, res: Response) => {
  const slug: string = (req.params.slug as string).toLowerCase();
  const updatedCourt = req.body;
  const courtIndex = courtDetails.findIndex((court: any)=> court.slug.toLowerCase() === slug);
  courtDetails[courtIndex] = Object.assign(courtDetails[courtIndex], updatedCourt);
  res.status(201).json(courtDetails[courtIndex]);
});

app.listen(port, () => {
  console.log(`Application started: http://localhost:${port}`);
});
