Prototypical Cloud-CI server using Docker & Node.js/express

# Why should I use it?

You shouldn't. This is just an exercise.

# Running

## Preconditions 

- For now just for docker-machine/boot2docker
- Node > 4.1.x (the latest and greatest)
- Deps installed (`npm install`), obviously

## Server

- `DOCKER_HOST` and `DOCKER_CERT_PATH` are set. Running `env $(docker-machine env default)` will
  usually setup the environment accordingly.
- Start server with `npm start` (or `node app/server` if you must)

## Docker

- Build image 'protoci/workspace-base' from `Dockerfile` in `docker/workspace-base`
- Pull `node:4` image into your local docker

## Frontend

- Build the app: `grunt browserify` (or use `grunt watch` to auto-build)
- When server is running, it should be on [localhost:3000](http://localhost:3000)


# Cleaning Up

## Removing Containers Created by the Server

```sh
docker rm `docker ps -aq --filter='name=protoci_*'`
```
