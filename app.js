const http = require("http");
const fs = require("fs");

const server = http.createServer(function(request, response){
    console.log("Received request at: " + request.url);

    if(request.url == "/" || request.url == "/index"){
        fs.readFile("index.html", function(err, data){
            response.setHeader("Content-Type", "text/html");
            if(err){data = "An unknown error occured."; console.log(err)};
            response.write(data);
            response.end();
        })
        //response.write(indexPage);
    }else if(request.url == "/my/profile"){
        fs.readFile("profile.html", function(err, data){
            response.setHeader("Content-Type", "text/html");
            if(err){data = "An unknown error occured."; console.log(err)};
            response.write(data);
            response.end();
        })
    }
    //response.setHeader("Content-Type", "text/html");
})

const port = process.env.PORT || 3000; // Look for a environment variable "PORT" or default to port 3000
server.listen(port, "localhost", function(){ // Listen for requests on localhost:port
    console.log("The server is now running at localhost:" + port);
});