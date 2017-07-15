# chatterbot-api
Web API for [Chatterbot](https://github.com/gunthercox/chatterbot)

# How to Use

### Installing the server

Cloning into the repository

```sh
$ git clone https://github.com/gabru-md/chatterbot-
$ cd chatterbot-api
```

Starting MongoDB Server

```sh
$ sudo service mongodb start
```

Installing packages from package.json

```sh
$ npm install
```

Starting the Server

```sh
$ node app.js
```

### Generating the API-Key

Go to https://localhost:8900/ and Register yourself.

![API-Key](https://github.com/gabru-md/chatterbot-api/blob/master/images/APIKey.png?raw=true)

### Using API-Key to generate Responses

Go to the browser and type:
`https://localhost:8900/getResponse/{{ your apikey }}/{{ your message }}`

![API Message](https://github.com/gabru-md/chatterbot-api/blob/master/images/API_inUse.png?raw=true)

## Read Docs for more

Navigate to : `https://localhost:8900/howtouse`

![howtouse](https://github.com/gabru-md/chatterbot-api/blob/master/images/docs.png?raw=true)


## Author 
[gabru-md](https://github.com/gabru-md) <3
