FROM node:lts-alpine as build
# Fix vulnerabilities in npm lib machine
# use root in order to install/manage packages
USER root
# set WD to npm
WORKDIR /usr/local/lib/node_modules/npm

#Update and determine NPM version
RUN npm install npm@latest -g

WORKDIR /app
COPY package*.json ./

# RUN npm install --package-lock
RUN npm ci
COPY . ./

# build js & remove devDependencies from node_modules
RUN npm run build && npm prune --production

# use deterministic and estable version of Nodejs and Alpine Linux
FROM node:lts-alpine

# add dumb-init to OS in order to correctly handle SIGKILL events to child processes
RUN apk --update --no-cache add dumb-init

# Fix vulnerabilities in npm lib machine
# use root in order to install/manage packages
USER root
# set WD to npm
WORKDIR /usr/local/lib/node_modules/npm

#Update and determine NPM version
RUN npm install npm@latest -g --production

#Remove dependencies (dev)
#RUN npm prune --production

#create non ROOT user
RUN addgroup -S nupp && adduser -S -g nupp nupp

#adjust ENV for your need
#ENV NODE_ENV=development

#set user`s home directory
ENV HOME=/home/nupp

#set WD to src of the app
WORKDIR ${HOME}/app

# ensure node path to current WD
ENV NODE_PATH=.

# copy source from repo to the inside of docker image setting ownership to non root user
COPY --chown=nupp:nupp --from=build  ["./app/dist", "${HOME}/app/dist"]
COPY --chown=nupp:nupp --from=build  ["./app/node_modules", "${HOME}/app/dist/node_modules"]

COPY --chown=nupp:nupp --from=build  ["./app/entrypoint.sh", "/entrypoint.sh"]
COPY --chown=nupp:nupp --from=build  ["./app/src/config/database.js", "${HOME}/app/dist/config/database.js"]

# set ownership to non root user in  OS binaries files in order to allow execution of node and the app
RUN chown -R nupp:nupp /usr/local && \
  chmod +x /entrypoint.sh

# Use this command  below in case of presence of wait script in your app
# Remember to aditionally add "&& \" in the above line in order to glue and complete the command line:
#    chmod +x ./wait-for

#1.Verify the contents of the cache folder, garbage collecting any unneeded data, and verifying the integrity of the cache index and all cached data.
#2. install all your packages listed in package.json npm-shrinkwrap.json or package-lock.json file.
#RUN npm cache verify && \
#    npm install --silent --progress=false --production

#set ownership of all files to the non root user
# RUN chown -R nupp:nupp ${HOME}/*

# change the runtime execution user from root to the created non root user
USER nupp

# document the service port (it won't publish the port just inform that port is being used inside the container)
EXPOSE 3000/tcp

#Ideally run "node <your_app.js>" and add the proper signal handling in your app instead of "npm run start" to gracefully close and disconnect from DB and http active connections
CMD ["sh", "/entrypoint.sh"]
