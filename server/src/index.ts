import { config } from 'dotenv';
import express from 'express';
import connectToDB from './connect';
import cors from 'cors';
import mainRoutes from './routes/mainRoutes';
import cookieParser from 'cookie-parser';
import { swaggerSpec, swaggerUi } from './swagger';


// Load environment variables
config();

// Initialize app and server from the Socket module
const app=express()

// Define the port
const port = process.env.PORT || 8000;

// Middleware
app.use(cookieParser()); // Parse cookies
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON payloads with a size limit
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Parse URL-encoded payloads

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect to the database
connectToDB()
  .then((connectMessage) => {
    console.log(connectMessage);

    // Register routes
    app.use(mainRoutes);

    // Start the server
    app.listen(port, () => {
      console.log(`Server started on port: ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });

export default app;
