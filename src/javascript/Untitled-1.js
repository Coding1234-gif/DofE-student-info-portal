var url = "https://newsapi.org/v2/top-headlines?category=sports&apiKey=f35021025f6b49af999e69d7aa095081";

var req = new Request(url);

fetch(req)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log(data);
        document.body.innerHTML += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    })
    .catch(function(error) {
        console.log(error);
        document.body.innerHTML += '<p style="color:red">Error: ' + error + '</p>';
    });