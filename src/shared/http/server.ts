import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

app.listen(process.env.PORT, function () {
  // eslint-disable-next-line no-console
  console.log(`App is running on port ${process.env.PORT}`);
});
