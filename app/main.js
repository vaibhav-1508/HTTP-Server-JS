const net = require("net");
const fs = require("fs");
const path = require("path");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });

  socket.on("data", (data) => {
    const method = data.toString().split(" ")[0];
    const request = data.toString().split(" ")[1];
    const req = data.toString().split(" ");
    const headers = data.toString().split("\r\n");

    var response;
    if (request === "/") {
      response = "HTTP/1.1 200 OK\r\n\r\n";
    } 
    else if (request.includes("/echo/")) {
      const encoding = data.toString().split("\r\n");

      if (encoding.includes("Accept-Encoding: gzip")) {
        response = `HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nContent-Type: text/plain\r\nContent-Length: ${request.split("/echo/")[1].length}\r\n\r\n${request.split("/echo/")[1]}`;
      } else {
        response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${request.split("/echo/")[1].length}\r\n\r\n${request.split("/echo/")[1]}`;
      }
    } 
    else if (request.startsWith("/files/") && method == "GET") {
      const directory = process.argv[3];

      const fileName = request.split("/files/")[1];

      const filePath = path.join(directory, fileName);
      console.log("HEREEE");
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);

        response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${data.length}\r\n\r\n${data}`;
      } else {
        response = "HTTP/1.1 404 Not Found\r\n\r\n";
      }
    } else if (request.startsWith("/files/") && method == "POST") {
      const directory = process.argv[3];
      const fileName = request.split("/files/")[1];
      const filePath = path.join(directory, fileName);
      const content = headers[headers.length - 1];
      fs.writeFileSync(filePath, content);
      response = "HTTP/1.1 201 Created\r\n\r\n";
    } else if (request == "/user-agent") {
      const userAgent = headers[2].split("User-Agent: ")[1];
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
    } else {
      response = "HTTP/1.1 404 Not Found\r\n\r\n";
    }
    socket.write(response);
  });
});

server.listen(4221, "localhost");
