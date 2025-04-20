import { config } from 'dotenv';
import express from 'express';
import connectToDB from './connect';
import cors from 'cors';
import mainRoutes from './routes/mainRoutes';
import env from './Ienv';
import cookieParser from 'cookie-parser';



const server = express();
config();
const port = env.PORT;

// Middleware
server.use(cookieParser()); // for cookies
server.use(cors()); // Enable CORS
server.use(express.json({ limit: '10mb' })); // Parse JSON payloads with a size limit
server.use(express.urlencoded({ limit: '10mb', extended: true })); // Parse URL-encoded payloads


// Connect to the database
connectToDB()
  .then((connectMessage) => {
    console.log(connectMessage);

    // Routes
    server.use(mainRoutes);

    // Start the server
    server.listen(port, () => {
      console.log('Server Started on Port: ' + port);
    });
  })
  .catch((e) => {
    console.error('Database connection error:', e);
  });

export default server;