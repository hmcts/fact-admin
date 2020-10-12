import { Application } from 'express';

export default function(app: Application): void {

  app.get('/secured-page', (req: any, res) => {
    if (!req.user) {
      res.redirect('/login');
    } else {
      res.render('secured-page');
    }
  });

}
