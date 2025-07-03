const express = require('express');
const app = express();
const PORT = 4001;

const images = [
  {
    id: 'img1',
    url: 'https://picsum.photos/seed/img1/300/200',
    l1: 10, l2: 20, l3: 30, l4: 40, l5: 50,
    w1: 5, w2: 6, w3: 7
  },
  {
    id: 'img2',
    url: 'https://picsum.photos/seed/img2/300/200',
    l1: 15, l2: 25, l3: 35, l4: 45, l5: 55,
    w1: 8, w2: 9, w3: 10
  }
];

app.get('/api/images', (req, res) => {
  res.json({ images });
});

app.listen(PORT, () => {
  console.log(`Mock image server running on http://localhost:${PORT}/api/images`);
});