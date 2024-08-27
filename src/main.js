// Import the necessary modules
const http = require('http');

// Define the port where the server will listen for incoming requests
const PORT = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Only handle POST requests (webhooks are usually POST requests)
  if (req.method === 'POST') {
    let body = '';

    // Collect the incoming data
    req.on('data', chunk => {
      body += chunk.toString(); // Convert the data buffer to a string
    });

    // Handle the end of the data stream
    req.on('end', () => {
      // Parse the incoming JSON data
      try {
        const webhookData = JSON.parse(body);

        // TODO: Add your webhook handling logic here
        // Example: if (webhookData.event === 'someEvent') { ... }

        // Send a response back to the webhook sender to acknowledge receipt
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Webhook received successfully');
      } catch (error) {
        // Handle JSON parsing errors
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON');
      }
    });
  } else {
    // If the request is not a POST request, respond with a 405 Method Not Allowed
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
