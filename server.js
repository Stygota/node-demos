const http = require('http')
    , fs = require('fs')
    , url = require('url')
    , querystring = require('querystring')
    , figlet = require('figlet');
const { Http2ServerRequest } = require('http2');

const validPages = {
    '/' : { resource: 'index.html', contentType: {'Content-Type': 'text/html'} }
  , '/otherpage' : { resource: 'otherpage.html', contentType: {'Content-Type': 'text/html'} }
  , '/otherotherpage' : { resource: 'otherotherpage.html', contentType: {'Content-Type': 'text/html'} }
  , '/api' : { resource: '', contentType: {'Content-Type': 'application/json'} }
  , '/css/style.css' : { resource: 'css/style.css', contentType: {'Content-Type': 'text/css'} }
  , '/js/main.js' : { resource: 'js/main.js', contentType: {'Content-Type': 'text/javascript'} }
  ,
};

const server = http.createServer(
  (req, res) => {
    // grabbing path&filename from request
    const page = url.parse(req.url).pathname;
    // isolating querystring minus '?' - should be string since req.url is string arg
    const params = querystring.parse(url.parse(req.url).query);
    console.log(`Page : [${page}]`);
    console.log(`Params : `);
    for(let key in params) {
      console.log(`<${key}> : [${params[key]}]`);
    }

    let resourceLookup = validPages[page];
    // Bad request?
    // 404? Unsupported at the least...
    if (typeof(resourceLookup) === 'undefined') {
        figlet('404!!', function(err, data) {
          if(err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
          }
          writeToResponse(res, 404, undefined, undefined, data);
        });
        // exit early
        return;
    }
    let resource = resourceLookup.resource
      , contentType = resourceLookup.contentType;
    // api call?
    if (page === '/api') {
      if(!!params['student']) {
        let student = params['student'];
        let objToJson;
      
        // Which student?
        if(student == 'leon') {
          objToJson = {
            name: 'leon',
            status: 'Boss Man',
            currentOccupation: 'Baller'
          }
        } else {
          // everyone else
          objToJson = {
            name: "unknown",
            status: "unknown",
            currentOccupation: "unknown"
          }
        }
        writeToResponse(res, 200, contentType, JSON.stringify(objToJson));
        // exit early
        return;
      }
    }
    // normal resource request...
    fs.readFile(resource, function(err, data) {
        writeToResponse(res, 200, contentType, data);
    });
    return;
});

/**
 * Refactored to extract method for concise, chained response write
 * @param {http.ServerResponse} res - Response object to write to.
 * @param {number} statusCode - The response status code.
 * @param {Object} headers - Prefer the object form of headers to write to response.
 * @param {string} body - Stuff to write out to response body.
 * @param {string} [lastChunk] - Last bit to append to response body.
 */
function writeToResponse(res, statusCode = '', headers, body = '', lastChunk = '') {
  if(!!statusCode) { res.writeHead(statusCode, headers).write(body); }
    else { res.write(body); }
  if(!!lastChunk) { res.end(lastChunk); }
    else { res.end(); }
}

server.listen(8000);
