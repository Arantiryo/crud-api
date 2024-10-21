import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer();

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
