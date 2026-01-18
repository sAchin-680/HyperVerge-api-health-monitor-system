import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('API Health Monitor System is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.get('/', (_, res) => {
  res.json({ status: 'API IS RUNNING' });
});

app.listen(4000, () => {
  console.log('API is running on http://localhost:4000');
});
