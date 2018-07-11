FROM node:10-alpine
LABEL maintainer="tesse@informatik.uni-hamburg.de"

ARG HTTP_PORT=8080

ENV HOME /root

EXPOSE ${HTTP_PORT}

WORKDIR $HOME
COPY . $HOME
RUN cd $HOME
RUN NODE_ENV=development npm install
ENV NODE_ENV=production
RUN npm run build:prod
RUN npm prune
# RUN rm -rf $HOME/node_modules
# RUN npm i
CMD ["node","dist/app.js"]
