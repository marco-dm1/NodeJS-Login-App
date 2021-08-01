const http = require("http");

const server = http.createServer(function(request, response){
    console.log(request.url);
    response.write("hello!");
    response.end();
})

const port = process.env.PORT || 3000; // Look for a environment variable "PORT" or default to port 3000
server.listen(port, "localhost", function(){ // Listen for requests on localhost:port
    console.log("The server is now running at localhost:" + port);
});