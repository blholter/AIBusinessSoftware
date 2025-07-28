import express from 'express';
import path from 'path';

const app = express();

app.get('/', (req, res) => {
  res.json({ 
    message: "Railway test server working!",
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    env: process.env.NODE_ENV,
    port: process.env.PORT || '5000'
  });
});

app.get('/test-path', (req, res) => {
  try {
    const testPath = path.resolve(process.cwd(), "test");
    res.json({ 
      message: "Path resolution working!",
      testPath,
      cwd: process.cwd()
    });
  } catch (error) {
    res.json({ 
      error: error.message,
      cwd: process.cwd()
    });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Railway test server running on port ${port}`);
}); 