Prototypical Cloud-CI server using Docker & Node.js/express

# Why should I use it?

You shouldn't. This is just an exercise.

# Running

## Preconditions 

- For now just for docker-machine/boot2docker
- Node > 4.1.x (the latest and greatest)
- Deps installed (`npm install`), obviously

## Server

- Make sure `DOCKER_HOST` and `DOCKER_CERTS_PATH` are set. The latter must point to where your 
  docker-machine/boot2docker client certs are stored (usually `~/.docker/machine/certs`)
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
