require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const { connectAll, readDb, writeDb } = require('./db');
const sessionMw = require('./session');

const MSSV = process.env.MSSV;
const PREFIX = MSSV.slice(-3);
const VAT = Number(MSSV.slice(-1)) + 6;

const app = express();
app.set('trust proxy', 1); // cần cho cookie secure sau proxy của Render
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.use(express.urlencoded({ extended: true }));
app.locals.footer = { hoTen: process.env.HO_TEN, mssv: MSSV, vat: VAT };

(async () => {
  await connectAll();          // phải kết nối trước khi tạo session store
  app.use(sessionMw());

  app.get('/', async (req, res) => {
    req.session.views = (req.session.views || 0) + 1;
    const books = await readDb().collection('books').find().toArray(); // tài khoản ĐỌC
    res.render('home', { books, views: req.session.views, error: req.query.error });
  });

  app.post('/books', async (req, res) => {
    const { code, name, price } = req.body;
    if (!code || !code.startsWith(PREFIX))
      return res.status(400).redirect('/?error=Ma+san+pham+phai+bat+dau+bang+' + PREFIX);
    const p = Number(price);
    if (!(p >= 0)) return res.redirect('/?error=Gia+khong+hop+le');
    const priceAfterTax = +(p * (1 + VAT / 100)).toFixed(2);
    await writeDb().collection('books').insertOne({ code, name, price: p, vat: VAT, priceAfterTax }); // tài khoản GHI
    res.redirect('/');
  });

  app.listen(process.env.PORT || 3000);
  app.listen(process.env.PORT || 3000, () => console.log('Server chay tai http://localhost:' + (process.env.PORT || 3000)));
})();